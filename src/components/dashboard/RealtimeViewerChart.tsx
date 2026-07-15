import { useId } from 'react'
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardPanel from './DashboardPanel'
import DashboardSectionHeader from './DashboardSectionHeader'

export interface ViewerPoint {
  time: string
  viewers: number
}

export interface RealtimeViewerChartProps {
  data: ViewerPoint[]
  /** 집계 기준 시각 라벨(예: "14:37 기준") — 헤더 (i) 툴팁 */
  cutoffLabel?: string
}

/** 시간대별 실시간 시청 수를 반응형 영역 차트로 표현합니다. */
export default function RealtimeViewerChart({
  data,
  cutoffLabel,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const latest = data.at(-1)

  // Y축은 실 데이터 범위에 맞춰 동적으로(값 크기가 캠페인마다 달라 하드코딩 불가)
  const values = data.map((point) => point.viewers)
  const dataMin = values.length ? Math.min(...values) : 0
  const dataMax = values.length ? Math.max(...values) : 0
  const axisMin = Math.max(0, Math.floor((dataMin * 0.9) / 10) * 10)
  const axisMax = Math.ceil((dataMax * 1.1) / 10) * 10 || 100

  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x5 py-x5">
      <DashboardSectionHeader
        title="실시간 시청 수"
        description="선택한 캠페인의 시간대별 시청 추이를 보여줍니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="min-h-0 min-w-0 flex-1" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-chart-categorical-1)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-chart-categorical-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={{ stroke: 'var(--color-line-tertiary)' }}
              tickLine={false}
              tick={{ fill: 'var(--color-chart-axis-label)', fontSize: 14 }}
              height={28}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={{ stroke: 'var(--color-line-tertiary)' }}
              tickLine={false}
              tick={{ fill: 'var(--color-chart-axis-label)', fontSize: 14 }}
              domain={[axisMin, axisMax]}
              width={48}
            />
            <Area
              type="monotone"
              dataKey="viewers"
              stroke="var(--color-chart-categorical-1)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              baseValue={axisMin}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {latest && (
              <ReferenceDot
                x={latest.time}
                y={latest.viewers}
                r={3}
                fill="var(--color-chart-categorical-1)"
                stroke="none"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {latest
          ? `최근 ${latest.time} 시청 수는 ${latest.viewers}명입니다.`
          : '표시할 시청 데이터가 없습니다.'}
      </p>
    </DashboardPanel>
  )
}
