import { useId, useState } from 'react'
import type { ReactNode } from 'react'

export interface TooltipProps {
  /** 툴팁 본문 */
  content: ReactNode
  /** 호버/포커스 트리거 — 보통 (i) 아이콘 */
  children: ReactNode
  className?: string
}

/**
 * 호버/포커스 툴팁 (Figma Tooltip/Tooltip · Size=Medium, Position=Bottom).
 *
 * 다크 반투명 배경(cool-neutral-900 88% + brand-solid 5% 2겹) + backdrop-blur,
 * 흰 텍스트(label-1 medium). 꼭지는 우상단 고정, 위를 향한다.
 * 내용 폭은 최대 256px까지 자동(줄바꿈).
 */
export default function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span className="relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex cursor-help outline-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className={[
            'pointer-events-none absolute right-0 top-[calc(100%+8px)] z-50',
            'w-max min-w-[64px] max-w-[280px] rounded-x2 px-x3 py-x2 backdrop-blur-[32px]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* 꼭지 — 우상단 고정, 위 지향 */}
          <span className="absolute -top-[5px] right-[10px] size-[10px] overflow-hidden rounded-tl-[2px]">
            <span className="absolute inset-0 rotate-45 bg-[#171719] opacity-[0.88]" />
            <span className="absolute inset-0 rotate-45 bg-primary-brand-solid opacity-[0.05]" />
          </span>
          {/* 배경 2겹 (블러는 바깥 레이어에) */}
          <span className="absolute inset-0 rounded-x2 bg-[#171719] opacity-[0.88]" />
          <span className="absolute inset-0 rounded-x2 bg-primary-brand-solid opacity-[0.05]" />
          <span className="relative block break-words text-label-1-normal-medium text-text-primary-inverse">
            {content}
          </span>
        </span>
      )}
    </span>
  )
}
