import type {
  ExposureCell,
  ExposureLevel,
} from '@/components/dashboard/AgeExposureHeatmap'

export const DASHBOARD_HOURS = Array.from({ length: 18 }, (_, index) =>
  String(index + 6).padStart(2, '0'),
)

export const DASHBOARD_AGE_GROUPS = [
  '10대',
  '20대',
  '30대',
  '40대',
  '50대',
  '60대',
  '70대+',
]

const toLevel = (value: number): ExposureLevel =>
  Math.min(4, Math.max(0, value)) as ExposureLevel

/** 캠페인별로 재현 가능한 히트맵용 로컬 fixture를 생성합니다. */
export function createExposureCells(seed: number): ExposureCell[] {
  return DASHBOARD_AGE_GROUPS.flatMap((ageGroup, ageIndex) =>
    DASHBOARD_HOURS.map((hour, hourIndex) => {
      const peak = hourIndex >= 6 && hourIndex <= 13 ? 2 : 1
      const ageWeight = ageIndex >= 1 && ageIndex <= 4 ? 1 : 0
      const variation = (hourIndex + ageIndex + seed) % 3
      const all = toLevel(peak + ageWeight + variation - 1)

      return {
        ageGroup,
        hour,
        all,
        male: toLevel(all + ((hourIndex + seed) % 3) - 1),
        female: toLevel(all + ((ageIndex + seed) % 3) - 1),
      }
    }),
  )
}
