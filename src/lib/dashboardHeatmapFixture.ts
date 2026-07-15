import type {
  ExposureCell,
  ExposureLevel,
} from '@/components/dashboard/AgeExposureHeatmap'

export const DASHBOARD_HOURS = Array.from({ length: 19 }, (_, index) =>
  String(index + 6).padStart(2, '0'),
)

export const DASHBOARD_AGE_GROUPS = [
  '0-9세',
  '10-19세',
  '20-29세',
  '30-39세',
  '40-49세',
  '50-59세',
  '60세 이상',
]

// 피그마 기본 상태의 셀 강도를 행 단위로 그대로 옮긴 값입니다.
const BASE_LEVELS: ExposureLevel[][] = [
  [1, 1, 2, 3, 3, 4, 1, 2, 2, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 4, 2, 3, 3, 1, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 4, 2, 4, 1, 2, 1, 1, 1, 2, 0, 0, 0, 0, 0],
  [1, 2, 4, 1, 3, 3, 4, 1, 2, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 2, 3, 1, 4, 1, 2, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 4, 2, 1, 2, 2, 4, 1, 2, 3, 1, 1, 2, 0, 0, 0, 0, 0],
  [1, 1, 1, 2, 2, 3, 4, 2, 2, 2, 1, 2, 2, 1, 0, 0, 0, 0, 0],
]

const toLevel = (value: number): ExposureLevel =>
  Math.min(4, Math.max(0, value)) as ExposureLevel

/** 기본 디자인 패턴을 유지하면서 캠페인별 성별 fixture를 만듭니다. */
export function createExposureCells(seed: number): ExposureCell[] {
  return DASHBOARD_AGE_GROUPS.flatMap((ageGroup, ageIndex) =>
    DASHBOARD_HOURS.map((hour, hourIndex) => {
      const base = BASE_LEVELS[ageIndex]?.[hourIndex] ?? 0
      const all = base === 0 ? 0 : toLevel(base + (seed % 2))
      return {
        ageGroup,
        hour,
        all,
        male: base === 0 ? 0 : toLevel(base + ((hourIndex + seed) % 3) - 1),
        female: base === 0 ? 0 : toLevel(base + ((ageIndex + seed) % 3) - 1),
      }
    }),
  )
}
