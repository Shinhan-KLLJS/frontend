import type { ButtonHTMLAttributes } from 'react'
import { Square, SquareCheck } from 'lucide-react'
import Icon from './Icon'

export const CHECKBOX_SIZE = [20, 24] as const
export type CheckboxSize = (typeof CHECKBOX_SIZE)[number]

export interface CheckboxProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'children'
> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: CheckboxSize
  children?: string
}

/* ── Checkbox  ── */
export default function Checkbox({
  checked = false,
  onChange,
  size = 20,
  children,
  disabled,
  className,
  ...props
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        'inline-flex items-center gap-x1 font-sans',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon
        icon={checked ? SquareCheck : Square}
        size={size}
        color={disabled ? 'disabled' : checked ? 'primary-inverse' : 'caption'}
        className={[
          'shrink-0',
          checked
            ? disabled
              ? '[&_rect]:fill-line-disabled [&_rect]:stroke-line-disabled'
              : '[&_rect]:fill-line-brand [&_rect]:stroke-line-brand'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {children && (
        <span
          className={[
            'text-label-1-normal-medium',
            disabled ? 'text-text-disabled' : 'text-text-caption',
          ].join(' ')}
        >
          {children}
        </span>
      )}
    </button>
  )
}
