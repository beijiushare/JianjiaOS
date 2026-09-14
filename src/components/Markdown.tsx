import type { ReactNode } from 'react'

/**
 * 极简 Markdown 渲染，只覆盖 Release 更新说明常用的三种语法：
 * 标题（`#`）、无序列表（`-` / `*`）、粗体（`**`）。
 *
 * 为什么不引解析库：
 *   · 需求单一 —— 只渲染我们自己写的 Release 说明
 *   · 避免 `dangerouslySetInnerHTML`：这里用 React 元素拼装，天生免疫注入
 *   · 依赖越少越好，与本项目一贯取向一致
 *
 * 不支持的语法（表格、代码块、链接等）会按纯文本原样显示 —— 内容不会丢，
 * 只是没有样式。若将来真要这些，再换成 marked 之类的库。
 */
export function Markdown({ text }: { text: string }) {
  return <div className="md">{parse(text)}</div>
}

function parse(text: string): ReactNode[] {
  const blocks: ReactNode[] = []
  let listBuffer: string[] = []
  let key = 0

  const flushList = (): void => {
    if (listBuffer.length === 0) return
    const items = listBuffer
    listBuffer = []
    blocks.push(
      <ul key={`ul-${key++}`} className="md__ul">
        {items.map((item, i) => (
          <li key={i} className="md__li">
            {inline(item)}
          </li>
        ))}
      </ul>,
    )
  }

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()

    // 空行作为块分隔
    if (line.trim() === '') {
      flushList()
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading !== null) {
      flushList()
      blocks.push(
        <p key={`h-${key++}`} className="md__h">
          {inline(heading[2])}
        </p>,
      )
      continue
    }

    const listItem = /^\s*[-*]\s+(.*)$/.exec(line)
    if (listItem !== null) {
      listBuffer.push(listItem[1])
      continue
    }

    flushList()
    blocks.push(
      <p key={`p-${key++}`} className="md__p">
        {inline(line)}
      </p>,
    )
  }

  flushList()
  return blocks
}

/** 行内语法：**粗体**。其余原样保留 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  )
}
