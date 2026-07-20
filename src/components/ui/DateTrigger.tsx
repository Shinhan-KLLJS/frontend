import type { ButtonHTMLAttributes } from 'react'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import Icon from './Icon'
import { formatDate, isSameDay } from './date'
import type { DateRange } from './Calendar'

export interface DateTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  value?: DateRange
  open?: boolean
  /** 범위(2일) 선택용 — placeholder를 'YYYY.MM.DD-YYYY.MM.DD'로. 기본은 단일(1일) */
  range?: boolean
  /**
   * 날짜 텍스트 스타일. 기본 'field'.
   * - 'field'(폼 입력): 미선택 regular·placeholder → 선택 regular·primary
   * - 'toolbar'(대시보드): 미선택 regular·tertiary → 선택 bold·secondary
   */
  variant?: 'field' | 'toolbar'
  /** 미선택 시 표기 문구 (기본: range면 'YYYY.MM.DD-YYYY.MM.DD', 아니면 'YYYY.MM.DD') */
  placeholder?: string
}

const DATE_TEXT_CLASS = {
  field: {
    empty: 'text-body-1-normal-regular text-text-placeholder',
    filled: 'text-body-1-normal-regular text-text-primary',
  },
  toolbar: {
    empty: 'text-body-1-normal-regular text-text-tertiary',
    filled: 'text-body-1-normal-bold text-text-secondary',
  },
} as const

/**
 * 데이트 피커를 여는 트리거(드롭다운) — width 유동, height 48.
 * 표기: 미선택 placeholder(1일/2일, tertiary·regular) → 선택 시 날짜(secondary·bold).
 * 쉐브론은 클릭(open) 시 회전한다.
 */
export default function DateTrigger({
  value,
  open = false,
  range = false,
  variant = 'field',
  placeholder,
  className,
  ...props
}: DateTriggerProps) {
  const start = value?.start
  const end = value?.end
  const isRange = Boolean(start && end && !isSameDay(start, end))
  const emptyText =
    placeholder ?? (range ? 'YYYY.MM.DD - YYYY.MM.DD' : 'YYYY.MM.DD')
  const textClass = start
    ? DATE_TEXT_CLASS[variant].filled
    : DATE_TEXT_CLASS[variant].empty

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      className={[
        // width 유동 · height 48 · 컨테이너 p-x3 · 텍스트↔쉐브론 gap-x2
        'flex h-[48px] cursor-pointer items-center gap-x2 rounded-x3 bg-bg-secondary p-x3 font-sans',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {/* 캘린더↔텍스트 gap-x1 */}
      <span className="flex min-w-0 items-center gap-x1">
        <Icon
          icon={CalendarIcon}
          size="large"
          color={variant === 'field' ? 'placeholder' : 'secondary'}
        />
        <span className={['truncate whitespace-nowrap', textClass].join(' ')}>
          {start ? formatDate(start) : emptyText}
          {isRange && `-${formatDate(end)}`}
        </span>
      </span>
      <Icon
        icon={ChevronDown}
        size="large"
        color="secondary"
        className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}
