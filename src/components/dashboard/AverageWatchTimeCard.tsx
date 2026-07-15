import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import DashboardPanel from './DashboardPanel'
import DashboardSectionHeader from './DashboardSectionHeader'

export interface WatchTimeBucket {
  label: string
  value: number
  color: string
}

export interface AverageWatchTimeCardProps {
  averageSeconds: number
  buckets: WatchTimeBucket[]
  /** 집계 기준 시각 라벨(예: "14:37 기준") — 헤더 (i) 툴팁 */
  cutoffLabel?: string
}

/** 평균 시청시간과 구간별 비중을 반원 게이지로 표시합니다. */
export default function AverageWatchTimeCard({
  averageSeconds,
  buckets,
  cutoffLabel,
}: AverageWatchTimeCardProps) {
  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x10 py-x5">
      <DashboardSectionHeader
        title="평균 시청시간"
        description="시청이 감지된 이용자의 체류 시간을 구간별로 집계한 값입니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-x5">
        <div
          className="relative h-[168px] w-full overflow-hidden"
          aria-hidden="true"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={buckets}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={107}
                outerRadius={168}
                paddingAngle={0}
                stroke="none"
                isAnimationActive={false}
              >
                {buckets.map((bucket) => (
                  <Cell key={bucket.label} fill={bucket.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <svg
            className="pointer-events-none absolute bottom-0 left-1/2 h-[107px] w-[214px] -translate-x-1/2"
            viewBox="0 0 214 107"
          >
            <path
              d="M1 107A106 106 0 0 1 213 107"
              fill="none"
              stroke="var(--color-chart-sequential-1)"
              strokeWidth="3"
              strokeDasharray="1 4"
            />
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
            <strong className="text-title-2-bold text-text-primary">
              {averageSeconds.toFixed(1)} 초
            </strong>
            <span className="text-body-1-normal-regular text-text-caption">
              Average Time
            </span>
          </div>
        </div>
        <ul className="flex w-full items-center justify-center gap-x2 py-x1">
          {buckets.map((bucket) => (
            <li
              key={bucket.label}
              className="flex items-center gap-x1 text-label-1-normal-regular text-text-caption"
            >
              <i
                className="size-[12px] shrink-0 rounded-xs"
                style={{ backgroundColor: bucket.color }}
              />
              <span className="whitespace-nowrap">{bucket.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">
        평균 시청시간은 {averageSeconds.toFixed(1)}초이며,{' '}
        {buckets.map((bucket) => `${bucket.label} ${bucket.value}%`).join(', ')}
        입니다.
      </p>
    </DashboardPanel>
  )
}
