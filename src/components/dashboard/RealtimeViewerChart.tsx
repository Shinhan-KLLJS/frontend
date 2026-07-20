import { useId } from 'react'
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { ScrollArea } from '@/components/ui'
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
  /** 시간별 누적(기간 선택) 모드 — 포인트가 많아 폭을 초과하면 가로 스크롤한다. */
  scrollable?: boolean
}

/** 첫 라벨을 x축 왼쪽 끝에서 안쪽으로 밀어 넣는 여백(spacing-x5). */
const EDGE_LABEL_INSET = 20
/** 화면에 노출할 x축 라벨 최대 개수(1분 단위 데이터가 촘촘해도 과밀 방지). */
const MAX_LABELS = 8
/** 가로 스크롤 모드에서 포인트 1개당 최소 폭(px) — 컨테이너보다 넓어지면 스크롤. */
const SCROLL_POINT_WIDTH = 48

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
      fill="var(--color-text-secondary)"
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
  scrollable = false,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const latest = data.at(-1)

  // y축: 데이터 최대값을 0~max로 5등분(눈금 6개), 각 눈금값은 소수점 버림(floor)
  const values = data.map((point) => point.viewers)
  const dataMax = values.length ? Math.max(...values) : 0
  const yMax = dataMax > 0 ? dataMax : 5
  const yTicks = [
    ...new Set(Array.from({ length: 6 }, (_, i) => Math.floor((yMax * i) / 5))),
  ]

  // 오른쪽 빈 1칸(라벨 없는 트레일링 슬롯) → 라인/영역은 마지막 실데이터에서 끝남
  const series: { time: string; viewers: number | null }[] = [
    ...data,
    { time: '', viewers: null },
  ]

  // 스크롤 모드는 폭이 넉넉하니 라벨을 모두 노출, 그 외엔 과밀 방지 캡
  const labelInterval = scrollable
    ? 0
    : Math.max(0, Math.ceil(series.length / MAX_LABELS) - 1)

  const chart = (
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
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 14 }}
          domain={[0, yMax]}
          ticks={yTicks}
          width={48}
        />
        <Area
          type="monotone"
          dataKey="viewers"
          stroke="var(--color-chart-categorical-1)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          baseValue={0}
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
  )

  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x5">
      <DashboardSectionHeader
        title="실시간 시청 수"
        description="선택한 캠페인의 시간대별 시청 추이를 보여줍니다."
        cutoffLabel={cutoffLabel}
      />
      {scrollable ? (
        <ScrollArea
          axis="horizontal"
          size="small"
          className="min-h-0 min-w-0 flex-1"
          aria-hidden="true"
        >
          <div
            className="h-full"
            style={{ minWidth: series.length * SCROLL_POINT_WIDTH }}
          >
            {chart}
          </div>
        </ScrollArea>
      ) : (
        <div className="min-h-0 min-w-0 flex-1" aria-hidden="true">
          {chart}
        </div>
      )}
      <p className="sr-only">
        {latest
          ? `최근 ${latest.time} 시청 수는 ${latest.viewers}명입니다.`
          : '표시할 시청 데이터가 없습니다.'}
      </p>
    </DashboardPanel>
  )
}
