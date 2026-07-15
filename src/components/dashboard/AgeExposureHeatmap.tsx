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
  hours: string[]
  ageGroups: string[]
  cells: ExposureCell[]
  filter: GenderFilter
  onFilterChange: (value: GenderFilter) => void
}

const LEVEL_STYLE: Record<ExposureLevel, string> = {
  0: 'bg-chart-surface',
  1: 'bg-chart-sequential-1',
  2: 'bg-chart-sequential-2',
  3: 'bg-chart-sequential-3',
  4: 'bg-chart-sequential-4',
}

/** 시간과 연령대 교차 구간의 노출 강도를 히트맵으로 표현합니다. */
export default function AgeExposureHeatmap({
  hours,
  ageGroups,
  cells,
  filter,
  onFilterChange,
}: AgeExposureHeatmapProps) {
  const cellMap = new Map(cells.map((cell) => [`${cell.ageGroup}-${cell.hour}`, cell]))
  const columns = `64px repeat(${hours.length}, minmax(28px, 1fr))`

  return (
    <DashboardPanel className="flex h-[472px] flex-col gap-x5 py-x5">
      <div className="flex items-center justify-between gap-x4">
        <DashboardSectionHeader
          title="시간·연령별 노출도"
          description="시간대와 연령대별 상대적인 캠페인 노출 강도를 보여줍니다."
        />
        <GenderFilterChips
          value={filter}
          onChange={onFilterChange}
          label="노출도 성별 필터"
        />
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto">
        <div
          role="img"
          aria-label={`${filter} 기준 시간·연령별 노출도 히트맵`}
          className="grid min-w-[780px] items-center gap-x2 gap-y-x3"
          style={{ gridTemplateColumns: columns }}
        >
          <span />
          {hours.map((hour) => (
            <span key={hour} className="text-center text-caption-2-regular text-text-caption">
              {hour}
            </span>
          ))}
          {ageGroups.flatMap((ageGroup) => [
            <span key={`${ageGroup}-label`} className="text-label-2-regular text-text-secondary">
              {ageGroup}
            </span>,
            ...hours.map((hour) => {
              const level = cellMap.get(`${ageGroup}-${hour}`)?.[filter] ?? 0
              return (
                <span
                  key={`${ageGroup}-${hour}`}
                  title={`${hour} ${ageGroup} 노출 강도 ${level}`}
                  aria-label={`${hour} ${ageGroup} 노출 강도 ${level}`}
                  className={`h-[28px] rounded-[4px] ${LEVEL_STYLE[level]}`}
                />
              )
            }),
          ])}
        </div>
      </div>
      <div className="flex items-center justify-end gap-x2 text-caption-1-regular text-text-tertiary">
        <span>낮음</span>
        {([0, 1, 2, 3, 4] as ExposureLevel[]).map((level) => (
          <i key={level} className={`h-[10px] w-[28px] rounded-[2px] ${LEVEL_STYLE[level]}`} />
        ))}
        <span>높음</span>
      </div>
    </DashboardPanel>
  )
}
