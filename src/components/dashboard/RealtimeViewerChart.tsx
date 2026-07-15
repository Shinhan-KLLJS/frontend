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

/** 첫 라벨을 x축 왼쪽 끝에서 안쪽으로 밀어 넣는 여백(spacing-x5). */
const EDGE_LABEL_INSET = 20
/** 화면에 노출할 x축 라벨 최대 개수(1분 단위 데이터가 촘촘해도 과밀 방지). */
const MAX_LABELS = 8

interface AxisTickProps {
  x?: number
  y?: number
  index?: number
  payload?: { value?: string; index?: number }
}

/** ISO/에폭 대신 시각 문자열을 그대로 쓰되, 첫 라벨만 20px 안쪽으로. 빈 슬롯은 숨김. */
function AxisTick({ x = 0, y = 0, index, payload }: AxisTickProps) {
  const value = payload?.value
  if (!value) return <g />
  const idx = index ?? payload?.index ?? 0
  const dx = idx === 0 ? EDGE_LABEL_INSET : 0
  return (
    <text
      x={x + dx}
      y={y}
      dy={16}
      textAnchor="middle"
      fill="var(--color-chart-axis-label)"
      fontSize={14}
    >
      {value}
    </text>
  )
}

/**
 * 실시간 시청 수 — 증권 차트 스타일 영역 차트.
 * y축은 데이터 범위로 동적, 왼쪽은 플롯 끝까지·첫 라벨만 20px 인셋, 오른쪽엔 빈 1칸(최신=오른쪽 두번째).
 */
export default function RealtimeViewerChart({
  data,
  cutoffLabel,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const latest = data.at(-1)

  // y축 동적(캠페인마다 값 크기가 달라 하드코딩 불가)
  const values = data.map((point) => point.viewers)
  const dataMin = values.length ? Math.min(...values) : 0
  const dataMax = values.length ? Math.max(...values) : 0
  const pad = Math.max((dataMax - dataMin) * 0.15, dataMax * 0.05, 10)
  const axisMin = Math.max(0, Math.floor((dataMin - pad) / 10) * 10)
  const axisMax = Math.ceil((dataMax + pad) / 10) * 10 || 100

  // 오른쪽 빈 1칸(라벨 없는 트레일링 슬롯) → 라인/영역은 마지막 실데이터에서 끝남
  const series: { time: string; viewers: number | null }[] = [
    ...data,
    { time: '', viewers: null },
  ]

  const labelInterval = Math.max(0, Math.ceil(series.length / MAX_LABELS) - 1)

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
            data={series}
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
              height={28}
              interval={labelInterval}
              padding={{ left: 0, right: 0 }}
              tick={<AxisTick />}
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
              connectNulls={false}
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
