import type { HTMLAttributes, ReactNode } from 'react'

export interface DashboardPanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  radius?: 'medium' | 'large'
}

/** 대시보드 차트가 공통으로 사용하는 흰색 카드 컨테이너입니다. */
export default function DashboardPanel({
  children,
  className,
  radius = 'large',
  ...props
}: DashboardPanelProps) {
  return (
    <section
      className={[
        'min-w-0 overflow-hidden bg-bg-secondary p-x5',
        radius === 'medium' ? 'rounded-x3' : 'rounded-x4',
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
