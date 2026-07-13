import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import Icon from './Icon'

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  children?: string
  selected?: boolean
  short?: boolean
}

const INTERACTION_CLASS =
  'cursor-pointer hover:bg-primary-brand-weak hover:text-primary-brand-solid-hover active:bg-[var(--blue-100)] active:text-primary-brand-solid-pressed'

// 사이드바 LNB 메뉴 아이템
export default function MenuItem({
  icon,
  children,
  selected = false,
  short = false,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: MenuItemProps) {
  const textLabel = children

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-label={short ? (ariaLabel ?? textLabel) : ariaLabel}
      className={[
        'inline-flex items-center rounded-x2 p-x3 font-sans text-label-1-normal-bold whitespace-nowrap',
        short ? '' : 'w-full gap-x2 text-left',
        disabled
          ? 'cursor-not-allowed text-text-disabled-secondary'
          : selected
            ? 'text-text-brand'
            : 'text-text-primary-brand-solid-hover',
        !disabled && INTERACTION_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Icon icon={icon} size={20} />
      {!short && <span className="min-w-0 flex-1 truncate">{children}</span>}
    </button>
  )
}
