import { useId, useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import Button from './Button'
import InputField from './InputField'
import Icon from './Icon'
import Calendar, { CalendarMonthNav, type DateRange } from './Calendar'
import { dayKey, formatDate, isSameDay, maskDateInput, parseDate } from './date'

export interface DatePickerProps {
  value?: DateRange // 초기 선택 값 - {start}만 있으면 하루(1 Day), {start, end}면 기간(More Day)
  onChange?: (value: DateRange) => void
  onApply?: (value: DateRange) => void
  onClose?: () => void
  title?: string
  minDate?: Date
  maxDate?: Date
  defaultMonth?: Date
  className?: string
}

/**
 * 데이트 피커 패널 — Header(기간 설정 + 닫기) / Content(월 달력 + 시작·종료일 입력) / Footer(설정 기간 표시 + 취소·선택 완료)
 */
export default function DatePicker({
  value,
  onChange,
  onApply,
  onClose,
  title = '기간 설정',
  minDate,
  maxDate,
  defaultMonth,
  className,
}: DatePickerProps) {
  const [range, setRange] = useState<DateRange>(() => value ?? {})
  const [month, setMonth] = useState<Date>(
    () => defaultMonth ?? value?.start ?? new Date(),
  )
  const [startText, setStartText] = useState(() => formatDate(value?.start))
  const [endText, setEndText] = useState(() => formatDate(value?.end))
  const titleId = useId()

  // 달력 클릭과 동일한 min/max 날짜 범위 검사 (직접 입력용)
  const inBounds = (day: Date) =>
    !(minDate && dayKey(day) < dayKey(minDate)) &&
    !(maxDate && dayKey(day) > dayKey(maxDate))

  const commit = (next: DateRange) => {
    setRange(next)
    setStartText(formatDate(next.start))
    setEndText(formatDate(next.end))
    onChange?.(next)
  }

  /**
   * 선택 정책
   * 완성 상태에서 클릭 → 초기화 후 새 시작일
   * 시작일보다 빠른 날짜 클릭 → 스왑(클릭일=시작, 기존 시작일=종료)
   * 같은 날 재클릭 → 하루 기간 확정
   */
  const handleSelectDay = (day: Date) => {
    if (!range.start || range.end) {
      commit({ start: day })
    } else if (day.getTime() < range.start.getTime()) {
      commit({ start: day, end: range.start })
    } else {
      commit({ start: range.start, end: day })
    }
  }

  const handleStartText = (raw: string) => {
    const text = maskDateInput(raw) // '20260705' → '2026.07.05' 자동 포맷
    setStartText(text)
    const parsed = parseDate(text)
    if (!parsed || !inBounds(parsed)) return
    const keepEnd =
      range.end && parsed.getTime() <= range.end.getTime()
        ? range.end
        : undefined
    setRange({ start: parsed, end: keepEnd })
    setEndText(formatDate(keepEnd))
    setMonth(parsed)
    onChange?.({ start: parsed, end: keepEnd })
  }

  const handleEndText = (raw: string) => {
    const text = maskDateInput(raw)
    setEndText(text)
    const parsed = parseDate(text)
    if (!parsed || !range.start || !inBounds(parsed)) return
    if (parsed.getTime() < range.start.getTime()) {
      commit({ start: parsed, end: range.start })
    } else {
      commit({ start: range.start, end: parsed })
    }
    setMonth(parsed)
  }

  const isOneDay = Boolean(
    range.start && (!range.end || isSameDay(range.start, range.end)),
  )

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className={[
        'flex w-[480px] flex-col rounded-x3 bg-bg-secondary font-sans shadow-normal-small',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header - Title + 닫기 */}
      <div className="flex w-full items-start justify-between border-b border-line-secondary p-x4">
        <h2
          id={titleId}
          className="min-w-0 flex-1 text-headline-1-bold text-text-primary"
        >
          {title}
        </h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex size-[24px] cursor-pointer items-center justify-center text-text-primary"
        >
          <Icon icon={X} size="large" />
        </button>
      </div>

      {/* Content */}
      <div className="flex w-full items-stretch">
        <div className="flex flex-col items-center border-r border-line-secondary bg-bg-secondary p-x2">
          <CalendarMonthNav month={month} onMonthChange={setMonth} />
          <Calendar
            month={month}
            value={range}
            onSelectDay={handleSelectDay}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-x4 px-x2 py-x5">
          <InputField
            variant="date"
            label="시작일"
            required
            placeholder="YYYY.MM.DD"
            leadingIcon={<Icon icon={CalendarIcon} size="medium" />}
            value={startText}
            onChange={(e) => handleStartText(e.target.value)}
            onBlur={() => setStartText(formatDate(range.start))}
          />
          <InputField
            variant="date"
            label="종료일"
            required
            placeholder="YYYY.MM.DD"
            leadingIcon={<Icon icon={CalendarIcon} size="medium" />}
            value={endText}
            onChange={(e) => handleEndText(e.target.value)}
            onBlur={() => setEndText(formatDate(range.end))}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex w-full items-center justify-between border-t border-line-secondary px-x4 py-x3">
        <div className="flex min-w-0 flex-1 items-center gap-x1 text-body-1-normal-regular">
          <span className="whitespace-nowrap text-text-secondary">
            설정 기간:
          </span>
          {range.start && (
            <span className="flex items-center gap-x1 whitespace-nowrap text-text-primary">
              <span>{formatDate(range.start)}</span>
              {!isOneDay && range.end && (
                <>
                  <span>-</span>
                  <span>{formatDate(range.end)}</span>
                </>
              )}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-x2">
          <Button
            variant="line"
            color="secondary"
            size="medium"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            size="medium"
            disabled={!range.start || !range.end}
            onClick={() => onApply?.(range)}
          >
            선택 완료
          </Button>
        </div>
      </div>
    </div>
  )
}
