import type { ReactNode } from 'react'
import { ScreenShell } from '@/components/ScreenShell'

interface AboutContentProps {
  title: string
  children: ReactNode
}

export function AboutContent({ title, children }: AboutContentProps) {
  return (
    <ScreenShell title={title}>
      <div className="about-content">
        {children}
      </div>
    </ScreenShell>
  )
}
