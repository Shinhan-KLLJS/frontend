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

/**
 * 다중일(기간) 조회 시 (i) 툴팁 문구.
 * 시각 기준("HH:mm 기준")은 당일 조회에만 유효하므로, 기간을 걸면 누적임을 안내한다.
 */
export const PERIOD_CUMULATIVE_TOOLTIP = '선택 기간의 누적 데이터입니다'
