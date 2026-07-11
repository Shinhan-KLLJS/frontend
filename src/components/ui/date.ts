/** 달력 계열 공용 날짜 유틸 (Calendar / DatePicker / DateTrigger) */

/** 연월일만 비교하기 위한 키 */
export function dayKey(date: Date): number {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  )
}

export function isSameDay(a?: Date, b?: Date): boolean {
  return Boolean(a && b && dayKey(a) === dayKey(b))
}

/** Date → 'YYYY.MM.DD' */
export function formatDate(date?: Date): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

/** Date → 'YYYY.MM' */
export function formatMonth(month: Date): string {
  return `${month.getFullYear()}.${String(month.getMonth() + 1).padStart(2, '0')}`
}

/** 'YYYY.MM.DD' → Date */
export function parseDate(text: string): Date | undefined {
  const match = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/.exec(text.trim())
  if (!match) return undefined
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined
  }
  return date
}
