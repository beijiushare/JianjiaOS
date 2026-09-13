/* ==========================================================================
 * ApkUpdaterPlugin.kt —— 基于 Android DownloadManager 的应用内更新插件
 *
 * 配套文档: ./README.md
 *
 * 放置位置:
 *   android/app/src/main/java/<你的包名>/ApkUpdaterPlugin.kt
 *
 * 注册（MainActivity.java）:
 *   public class MainActivity extends BridgeActivity {
 *       @Override
 *       public void onCreate(Bundle savedInstanceState) {
 *           registerPlugin(ApkUpdaterPlugin.class);   // ← 必须在 super.onCreate 之前
 *           super.onCreate(savedInstanceState);
 *       }
 *   }
 *
 * 需要配合的配置（见 README §8.1）:
 *   1. AndroidManifest.xml 加 REQUEST_INSTALL_PACKAGES 权限
 *   2. res/xml/file_paths.xml 加 <external-files-path name="downloads" path="Download/" />
 *      ⚠️ Capacitor 通常已生成 file_paths.xml 和 FileProvider，先检查再改，别重复声明
 * ========================================================================== */

package com.jianjia.os

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File

@CapacitorPlugin(name = "ApkUpdater")
class ApkUpdaterPlugin : Plugin() {

    companion object {
        private const val APK_NAME = "update.apk"
        private const val MIME_APK = "application/vnd.android.package-archive"
    }

    private fun dm(): DownloadManager =
        context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

    /**
     * APK 的确定性落盘路径。
     *
     * 因为用 setDestinationInExternalFilesDir 指定了固定文件名，
     * 这里可以直接算出来 —— 不需要查 DownloadManager 数据库拿路径。
     *
     * 实际位置: /storage/emulated/0/Android/data/<pkg>/files/Download/update.apk
     * 对应 file_paths.xml 里的 <external-files-path name="downloads" path="Download/" />
     */
    private fun apkFile(): File =
        File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), APK_NAME)

    // ---------------------------------------------------------------- 下载

    /**
     * 入队下载。立即返回 download id，不等下载完成。
     *
     * 进度由 JS 侧轮询 status() 获取（见 README §5.3 的设计理由）。
     */
    @PluginMethod
    fun download(call: PluginCall) {
        val url = call.getString("url")
        if (url.isNullOrBlank()) {
            call.reject("url 不能为空")
            return
        }

        try {
            // ⚠️ 先删旧文件 —— 否则上一次的残留可能被当成新包
            apkFile().delete()

            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setTitle("应用更新")
                setDescription("正在下载新版本…")
                setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                )
                setDestinationInExternalFilesDir(
                    context, Environment.DIRECTORY_DOWNLOADS, APK_NAME
                )
                setMimeType(MIME_APK)
                setAllowedOverMetered(true)
                setAllowedOverRoaming(false)
            }

            val id = dm().enqueue(request)

            call.resolve(JSObject().put("id", id))
        } catch (e: Exception) {
            call.reject("下载入队失败: ${e.message}")
        }
    }

    /**
     * 查询下载状态。JS 侧每 800ms 调一次。
     *
     * 返回: { status, bytesDownloaded, totalBytes, progress, reason }
     *   status: pending | running | paused | successful | failed | unknown
     *   progress: 0-100，-1 表示总大小未知
     */
    @PluginMethod
    fun status(call: PluginCall) {
        // 注: 若你的 Capacitor 版本没有 PluginCall.getLong，
        //     改成 call.getDouble("id")?.toLong()
        val id = call.getLong("id")
        if (id == null) {
            call.reject("缺少 id")
            return
        }

        val ret = JSObject()
        val cursor = dm().query(DownloadManager.Query().setFilterById(id))

        if (cursor == null || !cursor.moveToFirst()) {
            cursor?.close()
            ret.put("status", "unknown")
            ret.put("bytesDownloaded", 0L)
            ret.put("totalBytes", -1L)
            ret.put("progress", -1)
            call.resolve(ret)
            return
        }

        try {
            val statusIdx = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
            val downIdx = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
            val totalIdx = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
            val reasonIdx = cursor.getColumnIndex(DownloadManager.COLUMN_REASON)

            val rawStatus = if (statusIdx >= 0) cursor.getInt(statusIdx) else -1
            val downloaded = if (downIdx >= 0) cursor.getLong(downIdx) else 0L
            val total = if (totalIdx >= 0) cursor.getLong(totalIdx) else -1L

            ret.put(
                "status",
                when (rawStatus) {
                    DownloadManager.STATUS_PENDING -> "pending"
                    DownloadManager.STATUS_RUNNING -> "running"
                    DownloadManager.STATUS_PAUSED -> "paused"
                    DownloadManager.STATUS_SUCCESSFUL -> "successful"
                    DownloadManager.STATUS_FAILED -> "failed"
                    else -> "unknown"
                }
            )
            ret.put("bytesDownloaded", downloaded)
            ret.put("totalBytes", total)
            ret.put("progress", if (total > 0) (downloaded * 100 / total).toInt() else -1)

            if (rawStatus == DownloadManager.STATUS_FAILED && reasonIdx >= 0) {
                ret.put("reason", cursor.getInt(reasonIdx))
            }
        } finally {
            cursor.close()
        }

        call.resolve(ret)
    }

    /** 取消下载并清掉残留文件（用户点「取消」时调） */
    @PluginMethod
    fun cancel(call: PluginCall) {
        val id = call.getLong("id")
        if (id != null) {
            try {
                dm().remove(id)
            } catch (e: Exception) {
                // 记录已不存在也无所谓
            }
        }
        apkFile().delete()
        call.resolve()
    }

    // ------------------------------------------------------------ 设备信息

    /**
     * 读取设备首选 CPU 架构，用于选择匹配的 APK 分包。
     *
     * Build.SUPPORTED_ABIS[0] 是设备的首选 ABI：
     *   64 位机 → "arm64-v8a"
     *   32 位机 → "armeabi-v7a"
     *
     * 注意：它反映的是【设备能力】，不是当前安装的 APK 用的是哪个 ABI。
     *       这正是我们要的 —— 永远下载最匹配设备的那份。
     *
     * 返回 { abi: String }
     */
    @PluginMethod
    fun getAbi(call: PluginCall) {
        val abi = Build.SUPPORTED_ABIS.firstOrNull() ?: "arm64-v8a"
        call.resolve(JSObject().put("abi", abi))
    }

    // ---------------------------------------------------------------- 安装

    /** 当前是否已获得「安装未知应用」授权 */
    private fun canInstall(): Boolean =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }

    /**
     * 查询安装权限状态，供 JS 提前做 UI 准备。
     * 返回 { granted: Boolean }
     */
    @PluginMethod
    fun checkInstallPermission(call: PluginCall) {
        call.resolve(JSObject().put("granted", canInstall()))
    }

    /** 跳转到「安装未知应用」系统设置页 */
    @PluginMethod
    fun requestInstallPermission(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                val intent = Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:${context.packageName}")
                ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                call.resolve()
            } catch (e: Exception) {
                call.reject("无法打开设置页: ${e.message}")
            }
        } else {
            call.resolve()
        }
    }

    /**
     * 拉起系统安装器。
     *
     * ⚠️ 最后一步必须用户手动点「安装」—— Android 不允许静默安装，这是平台硬约束。
     *
     * 承诺: 调用成功后返回；实际的安装结果无法从本方法获知（用户可能点取消）。
     *       要知道装没装成，等下次启动时比对 versionCode。
     */
    @PluginMethod
    fun install(call: PluginCall) {
        // ① 权限检查 —— 不做这一步的话，用户点「安装」会毫无反应且没有任何报错
        if (!canInstall()) {
            call.reject(
                "NEED_INSTALL_PERMISSION",
                "请先允许本应用安装未知来源的应用"
            )
            return
        }

        // ② 文件检查
        val apk = apkFile()
        if (!apk.exists() || apk.length() == 0L) {
            call.reject("APK_NOT_FOUND", "安装包不存在或为空，请重新下载")
            return
        }

        // ③ FileProvider → Intent
        try {
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",   // 必须与 manifest 里声明的 authority 一致
                apk
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, MIME_APK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("INSTALL_FAILED", "拉起安装器失败: ${e.message}")
        }
    }

    /** 清掉下载记录与残留文件（安装成功或用户放弃时调） */
    @PluginMethod
    fun cleanup(call: PluginCall) {
        val id = call.getLong("id")
        if (id != null) {
            try {
                dm().remove(id)
            } catch (e: Exception) {
                // ignore
            }
        }
        apkFile().delete()
        call.resolve()
    }
}
