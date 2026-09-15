/**
 * 集锦数据。
 *
 * 添加新条目：在数组末尾加一项即可，搜索自动生效。
 * 格式：{ name: '名称', url: '链接', description: '描述' }
 */
export interface Entry {
  name: string
  url: string
  description: string
}

export const entries: Entry[] = [
  {
    name: 'JianjiaOS',
    url: 'https://github.com/beijiushare/JianjiaOS',
    description: '本项目 —— 基于 Capacitor + React 的 Android 应用壳',
  },
]
