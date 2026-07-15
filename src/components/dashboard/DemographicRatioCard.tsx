import DashboardPanel from './DashboardPanel'
import DashboardSectionHeader from './DashboardSectionHeader'
import GenderFilterChips, { type GenderFilter } from './GenderFilterChips'

export interface DemographicRatio {
  ageGroup: string
  total: number
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
  const values = data.map(({ total, male, female }) =>
    filter === 'all' ? total : filter === 'male' ? male : female,
  )
  const maximum = Math.max(...values, 33.5)

  return (
    <DashboardPanel className="flex h-full min-w-[564px] flex-1 flex-col gap-x4 py-x5">
      <DashboardSectionHeader
        title="성별・연령 시청 비율"
        description="선택한 성별 기준으로 연령대별 시청 비중을 비교합니다."
      />
      <div className="flex h-[32px] items-center justify-between gap-x4">
        <GenderFilterChips
          value={filter}
          onChange={onFilterChange}
          label="시청 비율 성별 필터"
        />
        <div className="flex items-center gap-x2 text-label-1-normal-medium text-text-caption">
          {filter !== 'female' && (
            <Legend color="bg-chart-categorical-1" label="남성" />
          )}
          {filter !== 'male' && (
            <Legend color="bg-chart-sequential-1" label="여성" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-x2">
        {data.map(({ ageGroup, male, female }, index) => {
          const value = values[index]
          return (
            <div
              key={ageGroup}
              className="grid h-[24px] grid-cols-[60px_1fr_50px] items-center gap-x3"
            >
              <span className="text-right text-label-1-normal-regular text-text-secondary">
                {ageGroup}
              </span>
              <div className="relative h-[16px] overflow-hidden rounded-x1 bg-chart-surface">
                {filter === 'all' && female > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-1"
                    style={{ width: `${(female / maximum) * 100}%` }}
                  />
                )}
                {filter !== 'female' && male > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-x1 bg-chart-categorical-1"
                    style={{ width: `${(male / maximum) * 100}%` }}
                  />
                )}
                {filter === 'female' && female > 0 && (
                  <span
                    className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-1"
                    style={{ width: `${(female / maximum) * 100}%` }}
                  />
                )}
              </div>
              <strong className="text-right text-body-1-normal-medium text-text-primary">
                {formatRatio(value)}
              </strong>
            </div>
          )
        })}
      </div>
    </DashboardPanel>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-x1">
      <i className={`size-[12px] rounded-[2px] ${color}`} />
      {label}
    </span>
  )
}
