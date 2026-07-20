import { useId, useState } from 'react'
import { DatePicker, DateTrigger, MainOverlay } from '@/components/ui'
import { formatDate, parseDate } from '@/components/ui/date'

export interface OpenDateFieldProps {
  /** 'YYYY.MM.DD' 문자열 */
  value: string
  onChange: (value: string) => void
  errorMessage?: string
}

/**
 * 개업일 입력 필드 — 클릭 시 DatePicker(no_input)를 본문 중앙에 딤머와 함께 띄우고,
 * '선택 완료' 시 'YYYY.MM.DD'로 반영한다. 하루만 클릭해도 선택 완료가 활성(allowSingleDay).
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

      {/* 공통 DateTrigger(단일 날짜) — 폼 필드용 border/full-width는 className으로 */}
      <DateTrigger
        value={selected ? { start: selected } : undefined}
        open={open}
        aria-labelledby={labelId}
        aria-describedby={errorMessage ? errorId : undefined}
        aria-invalid={errorMessage ? true : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'w-full justify-between border transition-colors',
          errorMessage
            ? 'border-line-negative'
            : 'border-line-secondary focus-visible:border-line-brand',
        ].join(' ')}
      />

      {errorMessage && (
        <p id={errorId} className="text-caption-1-regular text-text-negative">
          {errorMessage}
        </p>
      )}

      {open && (
        // LNB·헤더 제외한 본문 영역 중앙에 딤머(Dimer_Black)와 함께 렌더
        <MainOverlay>
          <DatePicker
            type="no_input"
            allowSingleDay
            value={selected ? { start: selected } : undefined}
            defaultMonth={selected}
            maxDate={new Date()}
            onApply={(range) => {
              if (range.start) onChange(formatDate(range.start))
              setOpen(false)
            }}
            onClose={() => setOpen(false)}
          />
        </MainOverlay>
      )}
    </div>
  )
}
