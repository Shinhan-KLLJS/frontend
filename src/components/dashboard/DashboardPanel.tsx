import type { HTMLAttributes, ReactNode } from 'react'

export interface DashboardPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

/** 대시보드 차트가 공통으로 사용하는 흰색 카드 컨테이너입니다. */
export default function DashboardPanel({
  children,
  className,
  ...props
}: DashboardPanelProps) {
  return (
    <section
      className={[
        'min-w-0 overflow-hidden bg-bg-secondary p-x5 rounded-x4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </section>
  )
}
