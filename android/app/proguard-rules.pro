# ============================================================================
# Capacitor 插件
#
# ⚠️ 插件由 Capacitor 通过【反射】按名字加载（@CapacitorPlugin(name = "ApkUpdater")）。
#    类名或 @PluginMethod 方法名被混淆后，JS 侧调用会报 "not implemented"，
#    而且错误被 UI 吞掉、极难排查。
#
# 本项目 release 构建开启了 minifyEnabled + shrinkResources，
# 因此这几条是必需的，不是「可选优化」。
# ============================================================================

-keep class com.jianjia.os.ApkUpdaterPlugin { *; }

-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

-keep class * extends com.getcapacitor.Plugin { *; }

-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod <methods>;
}

# WebView 与 JS 交互的接口
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ============================================================================
# 其他
# ============================================================================

# 保留行号，便于线上崩溃栈可读
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
