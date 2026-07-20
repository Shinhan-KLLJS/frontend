import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import Icon from './Icon'

export const TEXT_BUTTON_SIZE = ['large', 'medium'] as const
export type TextButtonSize = (typeof TEXT_BUTTON_SIZE)[number]

// Text Button
const SIZE_CLASS: Record<TextButtonSize, string> = {
  large: 'h-[36px] px-x4 py-[6px] text-body-1-normal-bold',
  medium: 'h-[32px] px-x2 py-[6px] text-label-1-normal-bold',
}

const ICON_PX: Record<TextButtonSize, number> = {
  large: 20,
  medium: 16,
}

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: TextButtonSize
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  /** 아이콘에 얹을 클래스(예: 드롭다운 open 시 쉐브론 회전 transition-transform rotate-180) */
  leadingIconClassName?: string
  trailingIconClassName?: string
  children?: ReactNode
}

/** 텍스트 버튼 — Size(Large/Medium) × Disable. ref 포워딩(DropdownMenu asChild 트리거 등). */
const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  function TextButton(
    {
      size = 'large',
      leadingIcon,
      trailingIcon,
      leadingIconClassName,
      trailingIconClassName,
      className,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={[
          // justify는 기본(start) — 고정 폭에서 정렬 오버라이드(justify-end 등) 가능
          'inline-flex items-center gap-x1 font-sans whitespace-nowrap',
          'cursor-pointer',
          // hover 오버레이 없음(디자인상 텍스트 버튼은 hover 상태 없음)
          'rounded-x2',
          'text-text-primary disabled:text-text-disabled',
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {leadingIcon && (
          <Icon
            icon={leadingIcon}
            size={ICON_PX[size]}
            className={leadingIconClassName}
          />
        )}
        {children}
        {trailingIcon && (
          <Icon
            icon={trailingIcon}
            size={ICON_PX[size]}
            className={trailingIconClassName}
          />
        )}
      </button>
    )
  },
)

export default TextButton
