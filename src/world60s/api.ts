/**
 * 60s 知世界 — API 层
 *
 * 多实例轮询降级：请求第一个实例，超时或失败就换下一个，直到成功。
 */

const INSTANCES = [
  'https://60s.viki.moe',
  'https://60s.crystelf.top',
  'https://api.elysiayanyu.top',
  'https://60s.7se.cn',
  'https://60s.mizhoubaobei.top',
  'https://api.cczo.cc/60s',
  'https://60s.zellon.top',
  'https://60s.superjeason.qzz.io',
]

const TIMEOUT_MS = 5000

export interface Day60sData {
  date: string
  news: string[]
  image: string
  tip: string
  cover: string
  day_of_week: string
  lunar_date: string
}

interface ApiResponse {
  code: number
  data: Day60sData
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 获取今日 60 秒资讯，自动在多个实例间降级。
 * 返回 null 表示全部失败。
 */
export async function fetchDay60s(date?: string): Promise<Day60sData | null> {
  const query = date ? `?date=${date}` : ''
  for (const base of INSTANCES) {
    try {
      const resp = await fetchWithTimeout(`${base}/v2/60s${query}`, TIMEOUT_MS)
      if (!resp.ok) continue
      const json = (await resp.json()) as ApiResponse
      if (json.code === 200 && json.data) return json.data
    } catch {
      // 超时或网络错误，尝试下一个实例
    }
  }
  return null
}
