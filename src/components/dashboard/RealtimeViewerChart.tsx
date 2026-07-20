import { useId } from 'react'
import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { ScrollArea, SCROLLBAR_SIZE } from '@/components/ui'
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

/** x축 라벨 1개 폭(px) — 숫자값 width. */
const X_LABEL_WIDTH = 40
/** x축 라벨 사이 간격(px) — spacing-x5. */
const X_LABEL_GAP = 20
/** 라벨 슬롯 폭 = 숫자(40) + 간격(20). 이 폭 미만으로는 라벨을 겹쳐 그리지 않는다. */
const X_LABEL_SLOT = X_LABEL_WIDTH + X_LABEL_GAP
/** 플롯 좌측 시작 여백(px) — 그래프/첫 라벨을 y축에서 살짝 띄워 시작. */
const PLOT_LEFT_PAD = 24
/** 가로 스크롤 모드에서 포인트 1개당 폭(px) = 라벨 슬롯(40+20). 컨테이너보다 넓어지면 스크롤. */
const SCROLL_POINT_WIDTH = X_LABEL_SLOT
/** y축(숫자) 영역 폭(px) = 숫자 40 + 그래프와 간격 8. */
const AXIS_W = X_LABEL_WIDTH + 8
/** 차트 여백 — 상단 10(6눈금 40px 균등), x축 하단 28. */
const CHART_MARGIN = { top: 10, right: 0, bottom: 0, left: 0 }
/** 차트 높이(px) — 플롯 200px(=높이 238 - 상단10 - x축28)로 눈금 40px 균등. */
const CHART_HEIGHT = 238
/**
 * 값 0~max가 매핑되는 플롯 높이(px)와 상단 오프셋 — 고정 y축 라벨 위치 계산에 사용.
 * 스크롤 모드의 플롯은 하단 가로 스크롤바(9px)만큼 높이가 줄어드니 이를 뺀다.
 */
const PLOT_TOP = CHART_MARGIN.top
const PLOT_H = CHART_HEIGHT - CHART_MARGIN.top - 28 - SCROLLBAR_SIZE.small

interface AxisTickProps {
  x?: number
  y?: number
  index?: number
  payload?: { value?: string; index?: number }
}

/** ISO/에폭 대신 시각 문자열을 그대로 쓰되, 첫 라벨만 20px 안쪽으로. 빈 슬롯은 숨김. */
function AxisTick({ x = 0, y = 0, payload }: AxisTickProps) {
  const value = payload?.value
  if (!value) return <g />
  return (
    <text
      x={x}
      y={y}
      // py-x1(4px) 아래로 내려 라벨 배치
      dy={16}
      textAnchor="middle"
      fill="var(--color-text-secondary)"
      fontSize={14}
      fontWeight={400}
      letterSpacing="0.0145em"
    >
      {value}
    </text>
  )
}

/**
 * 실시간 시청 수 — 증권 차트 스타일 영역 차트.
 * y축은 데이터 범위로 동적(max÷5, 6눈금), 왼쪽은 플롯 끝까지·첫 라벨만 20px 인셋, 오른쪽엔 빈 1칸(최신=오른쪽 두번째).
 */
export default function RealtimeViewerChart({
  data,
  cutoffLabel,
  scrollable = false,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const latest = data.at(-1)

  // y축: 데이터 최대값을 0~max로 5등분(눈금 6개: 0·max/5·…·max), 각 눈금값은 소수점 버림(floor).
  // 플롯 높이 200px(축 영역 210px)에서 6눈금이 균등 배치돼 아래에서부터 40·80·120·160·200px에 놓인다.
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

  const gradient = (
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
  )

  const xAxis = (
    <XAxis
      dataKey="time"
      axisLine={{ stroke: 'var(--color-line-tertiary)' }}
      tickLine={false}
      height={28}
      // 스크롤(기간)은 매 시간 전부, 비스크롤(당일)은 슬롯 40+20(minTickGap)으로 자동 솎음
      interval={scrollable ? 0 : 'preserveStartEnd'}
      minTickGap={X_LABEL_GAP}
      padding={{ left: PLOT_LEFT_PAD, right: 0 }}
      tick={<AxisTick />}
    />
  )

  // 시각마다 포인트(dot) + 꺾은선(직선 구간)
  const area = (
    <Area
      type="linear"
      dataKey="viewers"
      stroke="var(--color-chart-categorical-1)"
      strokeWidth={2}
      fill={`url(#${gradientId})`}
      baseValue={0}
      connectNulls={false}
      dot={{
        r: 3,
        fill: 'var(--color-chart-categorical-1)',
        stroke: 'var(--color-bg-secondary)',
        strokeWidth: 1.5,
      }}
      activeDot={{ r: 4, strokeWidth: 2 }}
      isAnimationActive={false}
    />
  )

  // hide면 렌더 없이 도메인만 유지(스크롤 플롯용) — 실제 라벨은 고정 y축 오버레이가 그린다.
  const renderYAxis = (hide: boolean) => (
    <YAxis
      hide={hide}
      axisLine={{ stroke: 'var(--color-line-tertiary)' }}
      tickLine={false}
      // 숫자값 label-1-normal-regular(14·400)·text-secondary, 그래프와 간격 x2(8px)
      tick={{
        fill: 'var(--color-text-secondary)',
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: '0.0145em',
      }}
      tickMargin={8}
      domain={[0, yMax]}
      ticks={yTicks}
      width={AXIS_W}
    />
  )

  const plot = (withYAxis: boolean) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={CHART_MARGIN}>
        {gradient}
        {xAxis}
        {renderYAxis(!withYAxis)}
        {area}
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
        <div
          className="relative min-w-0"
          style={{ height: CHART_HEIGHT }}
          aria-hidden="true"
        >
          {/* 플롯만 가로 스크롤 — 왼쪽에 y축 폭만큼 패딩을 둬 고정 y축 자리를 비운다 */}
          <ScrollArea axis="horizontal" size="small" className="absolute inset-0">
            <div
              className="h-full"
              style={{
                minWidth: series.length * SCROLL_POINT_WIDTH + AXIS_W,
                paddingLeft: AXIS_W,
              }}
            >
              {plot(false)}
            </div>
          </ScrollArea>
          {/* y축 고정 — 스크롤과 무관하게 항상 좌측 표시(플롯 스케일에 맞춰 라벨 배치) */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 bg-bg-secondary"
            style={{ width: AXIS_W }}
          >
            {yTicks.map((t) => (
              <span
                key={t}
                className="absolute text-label-1-normal-regular text-text-secondary"
                style={{
                  right: 8,
                  top: PLOT_TOP + PLOT_H * (1 - t / yMax),
                  transform: 'translateY(-50%)',
                }}
              >
                {t}
              </span>
            ))}
            <div
              className="absolute right-0 bg-line-tertiary"
              style={{ top: PLOT_TOP, height: PLOT_H, width: 1 }}
            />
          </div>
        </div>
      ) : (
        <div
          className="min-w-0"
          style={{ height: CHART_HEIGHT }}
          aria-hidden="true"
        >
          {plot(true)}
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
