import DashboardPanel from './DashboardPanel'
import DashboardSectionHeader from './DashboardSectionHeader'
import GenderFilterChips, { type GenderFilter } from './GenderFilterChips'

export type ExposureLevel = 0 | 1 | 2 | 3 | 4

export interface ExposureCell {
  ageGroup: string
  hour: string
  all: ExposureLevel
  male: ExposureLevel
  female: ExposureLevel
}

export interface AgeExposureHeatmapProps {
  cells: ExposureCell[]
  filter: GenderFilter
  onFilterChange: (value: GenderFilter) => void
  /** 집계 기준 시각 라벨(예: "14시 기준") — 헤더 (i) 툴팁 */
  cutoffLabel?: string
}

// 히트맵 축·행은 데이터 유무와 무관하게 항상 고정: 06~24시(19칸) × 7개 연령대.
// 서버가 현재 시각까지의 시간만 내려줘도 레이아웃이 흔들리지 않게 여기서 고정한다.
// cells에 없는 (연령대,시간) 조합은 0(빈 셀)으로 렌더된다.
const HEATMAP_HOURS: string[] = Array.from({ length: 19 }, (_, i) =>
  String(i + 6).padStart(2, '0'),
)
const HEATMAP_AGE_GROUPS: string[] = [
  '0-9세',
  '10-19세',
  '20-29세',
  '30-39세',
  '40-49세',
  '50-59세',
  '60세 이상',
]

const LEVEL_STYLE: Record<ExposureLevel, string> = {
  0: 'bg-chart-surface',
  1: 'bg-chart-sequential-1',
  2: 'bg-chart-sequential-2',
  3: 'bg-chart-sequential-3',
  4: 'bg-chart-sequential-4',
}

/** 피그마의 36px 셀 규격으로 시간·연령대별 노출 강도를 표시합니다. */
export default function AgeExposureHeatmap({
  cells,
  filter,
  onFilterChange,
  cutoffLabel,
}: AgeExposureHeatmapProps) {
  const cellMap = new Map(
    cells.map((cell) => [`${cell.ageGroup}-${cell.hour}`, cell]),
  )

  return (
    <DashboardPanel className="flex h-[472px] flex-col gap-x4 py-x5">
      <DashboardSectionHeader
        title="시간・연령별 노출도"
        description="시간대와 연령대별 상대적인 캠페인 노출 강도를 보여줍니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="flex h-[32px] items-center justify-between gap-x4">
        <GenderFilterChips
          value={filter}
          onChange={onFilterChange}
          label="노출도 성별 필터"
        />
        <HeatmapScale />
      </div>
      <div className="min-w-0 overflow-x-auto">
        <div
          role="group"
          aria-label={`${filter} 기준 시간·연령별 노출도 히트맵`}
          className="flex min-w-[920px] flex-col gap-x2"
        >
          <HeatmapTimeAxis hours={HEATMAP_HOURS} />
          {HEATMAP_AGE_GROUPS.map((ageGroup) => (
            <div key={ageGroup} className="flex h-[36px] items-center gap-x7">
              <span className="w-[66px] shrink-0 text-right text-body-1-normal-regular text-text-primary">
                {ageGroup}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between">
                {HEATMAP_HOURS.map((hour) => {
                  const level =
                    cellMap.get(`${ageGroup}-${hour}`)?.[filter] ?? 0
                  return (
                    <span
                      key={`${ageGroup}-${hour}`}
                      role="img"
                      title={`${hour}시 ${ageGroup} 노출 강도 ${level}`}
                      aria-label={`${hour}시 ${ageGroup} 노출 강도 ${level}`}
                      className={`size-[36px] shrink-0 rounded-x1 ${LEVEL_STYLE[level]}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  )
}

function HeatmapScale() {
  return (
    <div className="flex items-center gap-x1 text-label-1-normal-medium text-text-caption">
      <span>Less</span>
      {([1, 2, 3, 4] as ExposureLevel[]).map((level) => (
        <i
          key={level}
          className={`size-[12px] rounded-[2px] ${LEVEL_STYLE[level]}`}
        />
      ))}
      <span>More</span>
    </div>
  )
}

function HeatmapTimeAxis({ hours }: { hours: string[] }) {
  return (
    <div className="flex h-[32px] items-center gap-x7">
      <span className="w-[66px] shrink-0" />
      <div className="flex min-w-0 flex-1 items-center justify-between">
        {hours.map((hour) => (
          <span
            key={hour}
            className="w-[36px] text-center text-body-1-normal-regular text-text-primary"
          >
            {hour}시
          </span>
        ))}
      </div>
    </div>
  )
}
