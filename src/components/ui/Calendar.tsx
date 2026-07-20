import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Icon from './Icon'
import { dayKey, formatMonth, isSameDay } from './date'

export const CALENDAR_DAY_STATE = [
  'default',
  'hover',
  'press',
  'focus',
  'disable',
  'day',
] as const
export type CalendarDayState = (typeof CALENDAR_DAY_STATE)[number]

export interface DateRange {
  start?: Date
  end?: Date
}

/**
 * 해당 월의 달력 날짜 배열 생성 — 월요일 시작, 항상 6주(42일) 고정.
 * 남는 칸은 인접 월 날짜(비활성)로 채워진다.
 */
function getCalendarWeeks(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7 // 월요일 시작 보정
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1 - offset)

  const weeks: Date[][] = []
  for (let w = 0; w < 6; w += 1) {
    const week: Date[] = []
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/* ── 일 셀 상태 ── */
export interface CalendarDayProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  state?: CalendarDayState
  selected?: boolean
  /** 전체폭 모드 — 셀이 그리드 열 폭을 채운다(No_Input 타입). 기본은 40×40 고정 */
  fullWidth?: boolean
  children?: ReactNode
}

const OVERLAY_BASE =
  'pointer-events-none absolute inset-0 rounded-full bg-[var(--cool-neutral-1000)] transition-opacity'

// Interaction/Strong — hover 7.5% · focus 12% · press 18%
const FORCED_OVERLAY: Partial<Record<CalendarDayState, string>> = {
  hover: 'opacity-[var(--interaction-strong-hover)]',
  focus: 'opacity-[var(--interaction-strong-focus)]',
  press: 'opacity-[var(--interaction-strong-press)]',
}

const INTERACTIVE_OVERLAY =
  'group-hover:opacity-[var(--interaction-strong-hover)] group-focus-visible:opacity-[var(--interaction-strong-focus)] group-active:opacity-[var(--interaction-strong-press)]'

const INTERACTIVE_AREA =
  'group-hover:bg-primary-brand-solid group-hover:text-text-primary-inverse group-focus-visible:bg-primary-brand-solid group-focus-visible:text-text-primary-inverse group-active:bg-primary-brand-solid group-active:text-text-primary-inverse'

/** 일 셀 — State 6종(Default/Hover/Press/Focus/Disable/Day), 40×40 */
export function CalendarDay({
  state,
  selected = false,
  disabled,
  fullWidth = false,
  className,
  children,
  ...props
}: CalendarDayProps) {
  // 전체폭이면 열 폭을 채우고(w-full), 아니면 40×40 고정
  const cellSize = fullWidth ? 'h-[40px] w-full' : 'size-[40px]'

  if (state === 'day') {
    return (
      <div
        className={[
          `flex ${cellSize} items-center justify-center font-sans text-label-2-medium text-text-secondary`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    )
  }

  const isDisabled = Boolean(disabled) || state === 'disable'
  const forcedActive =
    state === 'hover' || state === 'press' || state === 'focus'
  const isInteractive = !isDisabled && state === undefined

  const areaClass = [
    'relative flex size-[32px] items-center justify-center rounded-full text-label-2-medium',
    isDisabled
      ? 'text-text-disabled'
      : selected || forcedActive
        ? 'bg-primary-brand-solid text-text-primary-inverse'
        : 'text-text-primary',
    isInteractive && !selected ? INTERACTIVE_AREA : '',
  ]
    .filter(Boolean)
    .join(' ')

  const overlayClass = [
    OVERLAY_BASE,
    (state && FORCED_OVERLAY[state]) || 'opacity-0',
    isInteractive ? INTERACTIVE_OVERLAY : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        `group flex ${cellSize} cursor-pointer items-center justify-center font-sans focus-visible:outline-none disabled:cursor-default`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className={areaClass}>
        {children}
        <span aria-hidden="true" className={overlayClass} />
      </span>
    </button>
  )
}

/* ── 월 네비게이션  ── */
export interface CalendarMonthNavProps {
  month: Date
  onMonthChange: (month: Date) => void
  className?: string
}

/** 이전 쉐브론 + 'YYYY.MM' 라벨 + 다음 달 쉐브론 */
export function CalendarMonthNav({
  month,
  onMonthChange,
  className,
}: CalendarMonthNavProps) {
  const move = (delta: number) =>
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))

  return (
    <div
      className={[
        'flex h-[36px] w-full items-center justify-center gap-x1 px-x4 py-[6px] font-sans',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        aria-label="이전 달"
        onClick={() => move(-1)}
        className="flex cursor-pointer items-center justify-center rounded-x1 text-text-primary interaction-normal"
      >
        <Icon icon={ChevronLeft} size="medium" />
      </button>
      <span className="text-body-1-normal-bold text-text-primary">
        {formatMonth(month)}
      </span>
      <button
        type="button"
        aria-label="다음 달"
        onClick={() => move(1)}
        className="flex cursor-pointer items-center justify-center rounded-x1 text-text-primary interaction-normal"
      >
        <Icon icon={ChevronRight} size="medium" />
      </button>
    </div>
  )
}

/* ── 월 그리드 ── */
export interface CalendarProps {
  month: Date
  value?: DateRange
  onSelectDay?: (day: Date) => void
  minDate?: Date
  maxDate?: Date
  /** 전체폭 모드 — 그리드가 컨테이너 폭을 채운다(No_Input 타입). 기본은 280px 고정 */
  fullWidth?: boolean
  className?: string
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const

/** 통합: 네비 + 그리드 + 선택 — 범위 선택 시 시작/끝은 선택 원, 중간은 범위 배경(blue-100) */
export default function Calendar({
  month,
  value,
  onSelectDay,
  minDate,
  maxDate,
  fullWidth = false,
  className,
}: CalendarProps) {
  const weeks = getCalendarWeeks(month)
  const start = value?.start
  const end = value?.end
  const hasRange = Boolean(start && end && !isSameDay(start, end))

  return (
    <div
      className={[
        `grid grid-cols-7 font-sans ${fullWidth ? 'w-full' : 'w-[280px]'}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {WEEKDAY_LABELS.map((label) => (
        <CalendarDay key={label} state="day" fullWidth={fullWidth}>
          {label}
        </CalendarDay>
      ))}

      {weeks.flat().map((day) => {
        const outsideMonth = day.getMonth() !== month.getMonth()
        const beforeMin = Boolean(minDate && dayKey(day) < dayKey(minDate))
        const afterMax = Boolean(maxDate && dayKey(day) > dayKey(maxDate))
        const isDisabled = outsideMonth || beforeMin || afterMax

        const isStart = !outsideMonth && isSameDay(day, start)
        const isEnd = !outsideMonth && isSameDay(day, end)
        const inRange =
          !outsideMonth &&
          hasRange &&
          dayKey(day) > dayKey(start as Date) &&
          dayKey(day) < dayKey(end as Date)

        return (
          <div
            key={day.getTime()}
            className={`relative flex items-center justify-center ${fullWidth ? 'h-[40px]' : 'size-[40px]'}`}
          >
            {hasRange && (isStart || isEnd || inRange) && (
              <span
                aria-hidden="true"
                className={[
                  'absolute top-1/2 h-[32px] -translate-y-1/2 bg-[var(--blue-100)]',
                  inRange
                    ? 'inset-x-0'
                    : isStart
                      ? 'left-1/2 right-0'
                      : 'left-0 right-1/2',
                ].join(' ')}
              />
            )}
            <CalendarDay
              className="relative"
              fullWidth={fullWidth}
              aria-label={`${day.getFullYear()}년 ${day.getMonth() + 1}월 ${day.getDate()}일`}
              state={isDisabled ? 'disable' : undefined}
              selected={isStart || isEnd}
              aria-pressed={isStart || isEnd || undefined}
              onClick={() => onSelectDay?.(day)}
            >
              {day.getDate()}
            </CalendarDay>
          </div>
        )
      })}
    </div>
  )
}
