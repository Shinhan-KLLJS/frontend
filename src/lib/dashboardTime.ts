/** KST 시각 포맷 유틸. */

/** ISO date-time / Date → KST "HH:mm". 실패 시 빈 문자열. */
export function formatKstTime(value: string | Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul',
    }).format(new Date(value))
  } catch {
    return ''
  }
}

/** "HH:mm 기준" 라벨. 값이 없으면 현재 시각으로 대체(항상 시간 표기). */
export function formatCutoffLabel(value?: string | Date | null): string {
  const t = formatKstTime(value ?? new Date())
  return t ? `${t} 기준` : ''
}
