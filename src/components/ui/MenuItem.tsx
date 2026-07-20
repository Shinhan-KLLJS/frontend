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
    // 옵션 — px-x2 py-x1, 폭 풀, 높이 52(py-x1 8 + 내부 p-x3 24 + 아이콘 20)
    <button
      type="button"
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-label={short ? (ariaLabel ?? textLabel) : ariaLabel}
      className={[
        'flex items-center px-x2 py-x1 font-sans',
        short ? 'justify-center' : 'w-full',
        disabled ? '' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {/* 내부 콘텐츠 — p-x3, 아이콘 20 + gap-x2 + 텍스트. hover/선택 배경은 이 pill에 */}
      <span
        className={[
          'flex items-center gap-x2 rounded-x2 p-x3 text-label-1-normal-bold whitespace-nowrap',
          short ? '' : 'w-full text-left',
          disabled
            ? 'text-text-disabled-secondary'
            : selected
              ? 'text-text-brand'
              : 'text-text-primary-brand-solid-hover',
          !disabled && INTERACTION_CLASS,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon icon={icon} size={20} />
        {!short && <span className="min-w-0 flex-1 truncate">{children}</span>}
      </span>
    </button>
  )
}
