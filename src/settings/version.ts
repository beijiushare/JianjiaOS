import { App as CapacitorApp } from '@capacitor/app'

/**
 * 读取应用版本号。
 *
 * 数据源是原生层的 `App.getInfo()`，仅在原生环境可用 —— 浏览器里跑
 * `npm run dev` 时会抛错。因此失败时返回占位文案而不是向上抛，
 * 避免开发期整页崩掉。
 */
export async function getAppVersion(): Promise<string> {
  try {
    const info = await CapacitorApp.getInfo()
    return info.version === '' ? '未知' : info.version
  } catch {
    return '开发环境'
  }
}
