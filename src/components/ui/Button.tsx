import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import Icon from './Icon'

export const BUTTON_VARIANT = ['default', 'line', 'ghost'] as const
export type ButtonVariant = (typeof BUTTON_VARIANT)[number]

export const BUTTON_COLOR = ['primary', 'secondary'] as const
export type ButtonColor = (typeof BUTTON_COLOR)[number]

export const BUTTON_SIZE = ['large', 'medium', 'small'] as const
export type ButtonSize = (typeof BUTTON_SIZE)[number]

const SIZE_CLASS: Record<ButtonSize, string> = {
  large: 'h-[48px] gap-[6px] rounded-x3 px-x4 py-x3 text-body-1-normal-bold',
  medium:
    'h-[40px] gap-[5px] rounded-x2-5 px-x4 py-[10px] text-label-1-normal-bold',
  small: 'h-[32px] gap-x1 rounded-x2 px-x4 py-x2 text-caption-1-bold',
}

const ICON_ONLY_SIZE_CLASS: Record<ButtonSize, string> = {
  large: 'size-[48px] rounded-x3',
  medium: 'size-[40px] rounded-[10px]',
  small: 'size-[32px] rounded-x2',
}

const ICON_PX: Record<ButtonSize, number> = {
  large: 20,
  medium: 20,
  small: 16,
}

const COLOR_CLASS: Record<ButtonVariant, Record<ButtonColor, string>> = {
  default: {
    primary:
      'bg-primary-brand-solid text-text-primary-inverse interaction-strong disabled:bg-bg-disabled disabled:text-text-disabled',
    secondary:
      'bg-[var(--cool-neutral-20)] text-[var(--cool-neutral-800)] interaction-normal disabled:bg-bg-disabled disabled:text-text-disabled',
  },
  line: {
    primary:
      'border border-line-secondary bg-transparent text-text-brand interaction-light disabled:border-line-disabled disabled:text-text-disabled',
    secondary:
      'border border-line-secondary bg-transparent text-text-primary interaction-light disabled:border-line-disabled disabled:text-text-disabled',
  },
  // ghost: 테두리·배경 없는 아이콘/텍스트 버튼 (hover 시 옅은 오버레이만)
  ghost: {
    primary:
      'bg-transparent text-text-brand interaction-light disabled:text-text-disabled',
    secondary:
      'bg-transparent text-text-secondary interaction-light disabled:text-text-disabled',
  },
}

interface ButtonBaseProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color'
> {
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  children?: ReactNode
}

// iconOnly 버튼은 아이콘과 접근 가능한 이름이 없으면 빈 무명 버튼이 되므로 타입으로 강제
export type ButtonProps =
  | (ButtonBaseProps & { iconOnly?: false })
  | (ButtonBaseProps & {
      iconOnly: true
      leadingIcon: LucideIcon
      'aria-label': string
    })

// 버튼
export default function Button({
  variant = 'default',
  color = 'primary',
  size = 'large',
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center font-sans whitespace-nowrap',
        'cursor-pointer disabled:cursor-not-allowed',
        iconOnly ? ICON_ONLY_SIZE_CLASS[size] : SIZE_CLASS[size],
        COLOR_CLASS[variant][color],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leadingIcon && <Icon icon={leadingIcon} size={ICON_PX[size]} />}
      {!iconOnly && children}
      {!iconOnly && trailingIcon && (
        <Icon icon={trailingIcon} size={ICON_PX[size]} />
      )}
    </button>
  )
}
