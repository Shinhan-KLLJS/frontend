import { useId, useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { DatePicker, Icon } from '@/components/ui'
import { formatDate, parseDate } from '@/components/ui/date'

export interface OpenDateFieldProps {
  /** 'YYYY.MM.DD' 문자열 */
  value: string
  onChange: (value: string) => void
  errorMessage?: string
}

/**
 * 개업일 입력 필드 — 클릭 시 DatePicker 드롭다운을 열고, 날짜 선택 시 'YYYY.MM.DD'로 반영한다.
 * 드롭다운은 카드 흐름 밖(absolute)에 떠서 카드를 늘리지 않고, 래퍼의 pb-[80px]가 피커 아래 80px 여백을 만든다.
 * (이 여백까지 뷰포트를 넘으면 온보딩 루트의 세로 오버플로로 페이지 전체가 스크롤된다)
 */
export default function OpenDateField({
  value,
  onChange,
  errorMessage,
}: OpenDateFieldProps) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const errorId = useId()
  const selected = parseDate(value)

  return (
    <div className="relative flex w-full min-w-0 flex-1 flex-col gap-x2">
      {/* label 요소는 button을 가리킬 수 없어(htmlFor 미지원) span+aria-labelledby로 접근성 이름을 연결 */}
      <span
        id={labelId}
        className="flex items-center gap-xs text-label-1-normal-bold text-text-secondary"
      >
        개업일
        <span aria-hidden="true" className="text-text-negative">
          *
        </span>
      </span>

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        aria-describedby={errorMessage ? errorId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'flex w-full cursor-pointer items-center justify-between gap-x2 rounded-x2 border bg-bg-secondary px-x4 py-x3 transition-colors',
          errorMessage
            ? 'border-line-negative'
            : 'border-line-secondary focus-visible:border-line-brand',
        ].join(' ')}
      >
        <span className="flex min-w-0 items-center gap-x2">
          <Icon icon={Calendar} size={24} color="secondary" />
          <span
            className={[
              'truncate text-body-1-normal-regular',
              value ? 'text-text-primary' : 'text-text-placeholder',
            ].join(' ')}
          >
            {value || 'YYYY.MM.DD'}
          </span>
        </span>
        <Icon
          icon={ChevronDown}
          size={20}
          color="secondary"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {errorMessage && (
        <p id={errorId} className="text-caption-1-regular text-text-negative">
          {errorMessage}
        </p>
      )}

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-20 pb-[80px]">
          <DatePicker
            value={selected ? { start: selected } : undefined}
            defaultMonth={selected}
            maxDate={new Date()}
            onChange={(range) => {
              if (range.start) {
                onChange(formatDate(range.start))
                setOpen(false)
              }
            }}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
