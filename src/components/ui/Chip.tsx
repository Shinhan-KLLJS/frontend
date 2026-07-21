import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon } from '@/components/ui'

// Small 32 · Medium 36 · Large 40 (높이 px)
export const CHIP_SIZE = ['small', 'medium', 'large'] as const
export type ChipSize = (typeof CHIP_SIZE)[number]

const SIZE_STYLE: Record<ChipSize, { container: string; icon: number }> = {
  small: { container: 'h-[32px] text-label-1-normal-medium', icon: 14 },
  medium: { container: 'h-[36px] text-body-2-normal-regular', icon: 16 },
  large: { container: 'h-[40px] text-body-2-normal-regular', icon: 16 },
}

export interface ChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  selected?: boolean
  size?: ChipSize
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  children: ReactNode
}

// 필터 선택형 칩
export default function Chip({
  selected = false,
  size = 'medium',
  leadingIcon,
  trailingIcon,
  children,
  className,
  type = 'button',
  ...props
}: ChipProps) {
  const statusClass = props.disabled
    ? 'bg-bg-disabled text-text-disabled'
    : selected
      ? 'bg-[var(--cool-neutral-800)] text-text-primary-inverse cursor-pointer'
      : 'border border-line-primary bg-bg-secondary text-text-primary cursor-pointer'

  return (
    <button
      {...props}
      type={type}
      aria-pressed={selected}
      className={[
        'interaction-normal font-sans box-border inline-flex shrink-0 items-center justify-center gap-[3px] rounded-full px-[14px] whitespace-nowrap',
        SIZE_STYLE[size].container,
        statusClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leadingIcon && <Icon icon={leadingIcon} size={SIZE_STYLE[size].icon} />}
      {children}
      {trailingIcon && (
        <Icon icon={trailingIcon} size={SIZE_STYLE[size].icon} />
      )}
    </button>
  )
}
