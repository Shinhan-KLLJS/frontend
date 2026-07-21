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
 * 호버/포커스 툴팁 (Position=Bottom).
 * 다크 배경(cool-neutral-900) + 흰 텍스트(label-1 medium), 꼭지는 우상단 고정·위 지향.
 * 내용 폭 최대 280px까지 자동(줄바꿈).
 */
export default function Tooltip({
  content,
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span className="relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex outline-none"
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
            'w-max min-w-[64px] max-w-[280px] rounded-x2 px-x3 py-x2',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* 꼭지 — 우상단 고정, 위 지향 */}
          <span className="absolute -top-[5px] right-0 h-[5px] w-[20px] overflow-hidden">
            <span className="absolute left-[5px] top-[2px] size-[10px] rotate-45 rounded-tl-[2px]">
              <span className="absolute inset-0 bg-[var(--cool-neutral-900)]" />
            </span>
          </span>

          {/* 배경 */}
          <span className="absolute inset-0 rounded-x2 bg-[var(--cool-neutral-900)]" />
          <span className="relative block break-words text-label-1-normal-medium text-text-primary-inverse">
            {content}
          </span>
        </span>
      )}
    </span>
  )
}
