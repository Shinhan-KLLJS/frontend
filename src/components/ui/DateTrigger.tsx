import type { ButtonHTMLAttributes } from 'react'
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import Icon from './Icon'
import { formatDate, isSameDay } from './date'
import type { DateRange } from './Calendar'

export interface DateTriggerProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  value?: DateRange
  open?: boolean
}

/**
 * 데이트 피커를 여는 트리거
 * 표기는 값에 따라 동적: 미선택 YYYY.MM.DD → 하루(시작=종료) 날짜 1개 → 기간 '시작-종료'
 */
export default function DateTrigger({
  value,
  open = false,
  className,
  ...props
}: DateTriggerProps) {
  const start = value?.start
  const end = value?.end
  const isRange = Boolean(start && end && !isSameDay(start, end))

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      className={[
        'flex cursor-pointer items-center gap-x2 rounded-x3 bg-bg-secondary p-x3 font-sans',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="flex items-center gap-x1">
        <Icon icon={CalendarIcon} size="large" color="secondary" />
        <span
          className={[
            'whitespace-nowrap text-body-1-normal-regular',
            start ? 'text-text-primary' : 'text-text-tertiary',
          ].join(' ')}
        >
          {start ? formatDate(start) : 'YYYY.MM.DD'}
          {isRange && `-${formatDate(end)}`}
        </span>
      </span>
      <Icon
        icon={open ? ChevronUp : ChevronDown}
        size="large"
        color="secondary"
      />
    </button>
  )
}
