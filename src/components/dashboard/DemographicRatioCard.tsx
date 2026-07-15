import DashboardPanel from './DashboardPanel'
import DashboardSectionHeader from './DashboardSectionHeader'
import GenderFilterChips, { type GenderFilter } from './GenderFilterChips'

export interface DemographicRatio {
  ageGroup: string
  male: number
  female: number
}

export interface DemographicRatioCardProps {
  data: DemographicRatio[]
  filter: GenderFilter
  onFilterChange: (value: GenderFilter) => void
}

const formatRatio = (value: number) => `${value.toFixed(1)}%`

/** 성별과 연령대별 시청 비중을 가로 막대로 비교합니다. */
export default function DemographicRatioCard({
  data,
  filter,
  onFilterChange,
}: DemographicRatioCardProps) {
  const values = data.map(({ male, female }) =>
    filter === 'all' ? male + female : filter === 'male' ? male : female,
  )
  const maximum = Math.max(...values, 1)

  return (
    <DashboardPanel className="flex aspect-[564/348] h-auto flex-col gap-x4 py-x5">
      <div className="flex items-center justify-between gap-x4">
        <DashboardSectionHeader
          title="성별·연령 시청 비율"
          description="선택한 성별 기준으로 연령대별 시청 비중을 비교합니다."
        />
        <GenderFilterChips
          value={filter}
          onChange={onFilterChange}
          label="시청 비율 성별 필터"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        {data.map(({ ageGroup, male, female }, index) => {
          const value = values[index]
          return (
            <div
              key={ageGroup}
              className="grid grid-cols-[48px_1fr_44px] items-center gap-x3"
            >
              <span className="text-label-2-regular text-text-secondary">
                {ageGroup}
              </span>
              <div className="flex h-[14px] overflow-hidden rounded-full bg-chart-surface">
                {filter !== 'female' && (
                  <span
                    className="h-full bg-chart-categorical-1"
                    style={{ width: `${(male / maximum) * 100}%` }}
                  />
                )}
                {filter !== 'male' && (
                  <span
                    className="h-full bg-chart-categorical-2"
                    style={{ width: `${(female / maximum) * 100}%` }}
                  />
                )}
              </div>
              <strong className="text-right text-label-2-medium text-text-primary">
                {formatRatio(value)}
              </strong>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-x4 text-caption-1-regular text-text-tertiary">
        {filter !== 'female' && (
          <Legend color="bg-chart-categorical-1" label="남성" />
        )}
        {filter !== 'male' && (
          <Legend color="bg-chart-categorical-2" label="여성" />
        )}
      </div>
    </DashboardPanel>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-x1">
      <i className={`h-[8px] w-[8px] rounded-full ${color}`} />
      {label}
    </span>
  )
}
