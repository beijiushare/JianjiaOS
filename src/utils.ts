/**
 * 公共工具函数。
 *
 * 约定：日志必须拼成**单个字符串**再输出。
 * Capacitor 转发 console 到 logcat 时会把参数序列化，传对象只会得到
 * `[object Object]`，真实错误信息全丢。本项目为此白抓过两次日志。
 */

/** 把未知类型的异常转成可读字符串 */
export function errText(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`
  return String(e)
}

/** 消息 id 自增序列。不用随机数 —— id 要可读、可复现，便于排查 */
let messageSeq = 0
export const nextMessageId = (prefix = 'msg'): string =>
  `${prefix}-${String(Date.now())}-${String(++messageSeq)}`
