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
}

/** 평균 시청시간과 구간별 비중을 도넛 차트로 표시합니다. */
export default function AverageWatchTimeCard({
  averageSeconds,
  buckets,
}: AverageWatchTimeCardProps) {
  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x4 py-x5">
      <DashboardSectionHeader
        title="평균 시청시간"
        description="시청이 감지된 이용자의 체류 시간을 구간별로 집계한 값입니다."
      />
      <div className="flex min-h-0 flex-1 items-center gap-x5">
        <div className="relative h-[184px] min-w-0 flex-1" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={buckets}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {buckets.map((bucket) => (
                  <Cell key={bucket.label} fill={bucket.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-label-2-regular text-text-tertiary">
              평균
            </span>
            <strong className="text-title-2-bold text-text-primary">
              {averageSeconds.toFixed(1)}초
            </strong>
          </div>
        </div>
        <ul className="flex w-[112px] shrink-0 flex-col gap-x3">
          {buckets.map((bucket) => (
            <li
              key={bucket.label}
              className="flex items-center justify-between gap-x2"
            >
              <span className="flex min-w-0 items-center gap-x2 text-label-2-regular text-text-secondary">
                <i
                  className="h-x2 w-x2 shrink-0 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
                <span className="truncate">{bucket.label}</span>
              </span>
              <strong className="text-label-2-medium text-text-primary">
                {bucket.value}%
              </strong>
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
