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
  /** 집계 기준 시각 라벨(예: "14시 기준") — 헤더 (i) 툴팁 */
  cutoffLabel?: string
}

const formatRatio = (value: number) => `${value.toFixed(1)}%`

/** 성별과 연령대별 시청 비중을 가로 막대로 비교합니다. */
export default function DemographicRatioCard({
  data,
  filter,
  onFilterChange,
  cutoffLabel,
}: DemographicRatioCardProps) {
  const values = data.map(({ total, male, female }) =>
    filter === 'all' ? total : filter === 'male' ? male : female,
  )
  // 스케일 상한은 실제로 그려지는 막대의 최댓값 바로 위 10 단위 눈금.
  // all은 남+여 스택 합, male/female은 각 값 기준으로 잡아 값이 작아도 막대가 충분히 채워진다.
  // 절대 %는 우측 값 라벨로 확인한다.
  const drawnTotals =
    filter === 'male'
      ? data.map((d) => d.male)
      : filter === 'female'
        ? data.map((d) => d.female)
        : data.map((d) => d.male + d.female)
  const scaleMax = Math.max(10, Math.ceil(Math.max(0, ...drawnTotals) / 10) * 10)

  return (
    <DashboardPanel className="flex h-full min-w-[564px] flex-1 flex-col gap-x4">
      <DashboardSectionHeader
        title="성별・연령 시청 비율"
        description="선택한 성별 기준으로 연령대별 시청 비중을 비교합니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="flex h-[32px] items-center justify-between gap-x4">
        <GenderFilterChips
          value={filter}
          onChange={onFilterChange}
          label="시청 비율 성별 필터"
        />
        <div className="flex items-center gap-x2 text-label-1-normal-medium text-text-caption">
          {/* 칩 선택과 무관하게 남성·여성 범례를 항상 함께 노출 */}
          <Legend color="bg-chart-sequential-3" label="남성" />
          <Legend color="bg-chart-sequential-1" label="여성" />
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
                {filter === 'all' ? (
                  <>
                    {/* 남성은 둥근 pill(rounded-x1). 여성은 남성 끝에 이어 붙으므로
                        시작(왼쪽)은 각지게, 오른쪽 끝만 둥글게(rounded-r-x1) */}
                    {male > 0 && (
                      <span
                        className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-3"
                        style={{ width: `${(male / scaleMax) * 100}%` }}
                      />
                    )}
                    {female > 0 && (
                      <span
                        className="absolute inset-y-0 rounded-r-x1 bg-chart-sequential-1"
                        style={{
                          left: `${(male / scaleMax) * 100}%`,
                          width: `${(female / scaleMax) * 100}%`,
                        }}
                      />
                    )}
                  </>
                ) : filter === 'male' ? (
                  male > 0 && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-3"
                      style={{ width: `${(male / scaleMax) * 100}%` }}
                    />
                  )
                ) : (
                  female > 0 && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-1"
                      style={{ width: `${(female / scaleMax) * 100}%` }}
                    />
                  )
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
