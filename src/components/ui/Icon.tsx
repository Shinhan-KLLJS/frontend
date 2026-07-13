import type { LucideIcon, LucideProps } from 'lucide-react'

export const ICON_SIZE = {
  small: 16,
  medium: 20,
  large: 24,
} as const

export type IconSize = keyof typeof ICON_SIZE

// 시맨틱 Text 토큰 (tokens.css) 매핑
export const ICON_COLOR = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-secondary)',
  tertiary: 'var(--color-text-tertiary)',
  caption: 'var(--color-text-caption)',
  'primary-inverse': 'var(--color-text-primary-inverse)',
  'secondary-inverse': 'var(--color-text-secondary-inverse)',
  disabled: 'var(--color-text-disabled)',
  'disabled-secondary': 'var(--color-text-disabled-secondary)',
  placeholder: 'var(--color-text-placeholder)',
  brand: 'var(--color-text-brand)',
  negative: 'var(--color-text-negative)',
  'negative-contrast': 'var(--color-text-negative-contrast)',
  cautionary: 'var(--color-text-cautionary)',
  positive: 'var(--color-text-positive)',
  info: 'var(--color-text-info)',
} as const

export type IconColor = keyof typeof ICON_COLOR

export interface IconProps extends Omit<LucideProps, 'size' | 'ref' | 'color'> {
  icon: LucideIcon
  size?: IconSize | number
  /** 토큰 이름(brand, negative 등) 또는 CSS 색상값. 없으면 currentColor 상속 */
  color?: IconColor | (string & {})
  label?: string
}

// lucide 아이콘 래퍼
export default function Icon({
  icon: LucideComponent,
  size = 'medium',
  strokeWidth = 1.5,
  color,
  label,
  ...props
}: IconProps) {
  const resolvedSize = typeof size === 'number' ? size : ICON_SIZE[size]
  const resolvedColor =
    color && color in ICON_COLOR ? ICON_COLOR[color as IconColor] : color

  return (
    <LucideComponent
      size={resolvedSize}
      strokeWidth={strokeWidth}
      color={resolvedColor}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...props}
    />
  )
}
