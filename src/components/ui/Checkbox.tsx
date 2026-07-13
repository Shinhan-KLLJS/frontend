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
        'inline-flex items-center gap-[4px] font-sans',
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
        color={disabled ? 'disabled' : checked ? 'brand' : 'caption'}
        className="shrink-0"
      />
      {children && (
        <span
          className={[
            'text-label-1-normal-medium',
            disabled ? 'text-text-disabled' : 'text-[var(--cool-neutral-800)]',
          ].join(' ')}
        >
          {children}
        </span>
      )}
    </button>
  )
}
