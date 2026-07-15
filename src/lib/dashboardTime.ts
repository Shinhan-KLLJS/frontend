/** 대시보드 (i) 툴팁의 집계 기준 시각 라벨 유틸 */

/** ISO date-time / Date → KST "HH:mm". */
function formatKstMinute(value: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(new Date(value))
}

/**
 * 집계 기준 시각 라벨 "HH:mm 기준" (KST).
 *
 * 실 API 집계 기준시각(aggregationCutoffTime 등)을 넘기면 그 시각을,
 * 없으면(로딩·미연결·Storybook) 현재 시각을 표기해 **항상 시간이 보이도록** 한다.
 * 시간 단위 집계 응답은 cutoff가 정시라 자연히 "14:00 기준"처럼 표기된다.
 */
export function formatCutoffLabel(value?: string | Date | null): string {
  try {
    return `${formatKstMinute(value ?? new Date())} 기준`
  } catch {
    return `${formatKstMinute(new Date())} 기준`
  }
}
