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
  children?: ReactNode
}

/** 텍스트 버튼 — Size(Large/Medium) × Disable */
export default function TextButton({
  size = 'large',
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: TextButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center gap-x1 font-sans whitespace-nowrap',
        'cursor-pointer disabled:cursor-not-allowed',
        'rounded-x2 interaction-normal',
        'text-text-primary disabled:text-text-disabled',
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leadingIcon && <Icon icon={leadingIcon} size={ICON_PX[size]} />}
      {children}
      {trailingIcon && <Icon icon={trailingIcon} size={ICON_PX[size]} />}
    </button>
  )
}
