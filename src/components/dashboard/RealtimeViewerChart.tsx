import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
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

/** 플롯(그래프)·y축 높이(px) — Figma Live Viewer Graph 실측. */
const PLOT_HEIGHT = 212
/** x축 라벨 행 높이(px). */
const X_AXIS_HEIGHT = 28
/** y축 라벨 숫자 폭(px). 라벨 40 + pr-x2(8) = 축 폭 48(x축 좌측 빈 공간과 동일). */
const Y_LABEL_WIDTH = 40
/** 가로 스크롤 모드에서 포인트 1개당 폭(px) = 라벨 40 + 간격 x5(20). */
const SCROLL_POINT_WIDTH = Y_LABEL_WIDTH + 20
/** 플롯 좌우 인셋(px) — 라인이 축 테두리에 붙지 않도록(Figma Graph 콘텐츠 px-x5). */
const PLOT_X_PAD = 20
/** y축 눈금 개수(0 제외) — 값이 바뀌어도 항상 5개 고정. */
const Y_TICKS = 5
/** 당일(비스크롤) x축 라벨 최대 개수 — 넘으면 균등 솎음(라인·도트는 전부 유지). */
const MAX_X_LABELS = 13

/** 라벨 겹침 방지용 균등 샘플링 — 첫·끝 포함, 최대 MAX_X_LABELS개. */
function sampleLabels(data: ViewerPoint[]): ViewerPoint[] {
  if (data.length <= MAX_X_LABELS) return data
  const step = (data.length - 1) / (MAX_X_LABELS - 1)
  return Array.from(
    { length: MAX_X_LABELS },
    (_, k) => data[Math.round(k * step)],
  )
}

/** rough 값을 1·2·5·10 계열의 깔끔한 눈금 간격으로 올림. */
function niceStep(rough: number): number {
  const mag = 10 ** Math.floor(Math.log10(rough))
  const n = rough / mag
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * mag
}

/** 데이터 최댓값 → 5등분이 깔끔한 정수가 되는 y축 상한(최소 5). */
function niceYMax(max: number): number {
  if (max <= Y_TICKS) return Y_TICKS
  return niceStep(max / Y_TICKS) * Y_TICKS
}

/**
 * 실시간 시청 수 — 증권 차트 스타일 영역 차트.
 * 축은 recharts 자동 배치가 아니라 Figma대로 고정 위치 flexbox로 그린다.
 * - y축: 값이 바뀌어도 항상 5개 라벨(0 제외)이 같은 위치.
 * - x축: 라벨이 해상도로 솎이지 않고 항상 같은 위치.
 * 기간(scrollable) 모드는 타이틀이 "시간별 누적 시청 수"로 바뀌고 포인트가 많으면 가로 스크롤한다.
 */
export default function RealtimeViewerChart({
  data,
  cutoffLabel,
  scrollable = false,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const latest = data.at(-1)

  const dataMax = data.length ? Math.max(...data.map((p) => p.viewers)) : 0
  const yMax = niceYMax(dataMax)
  // 위에서부터 yMax, 4/5·yMax, …, 1/5·yMax (0은 축 바닥이라 라벨 생략)
  const yLabels = Array.from({ length: Y_TICKS }, (_, i) =>
    Math.round((yMax * (Y_TICKS - i)) / Y_TICKS),
  )

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

  // 시각마다 포인트(dot) + 꺾은선(직선 구간)
  const plot = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        {gradient}
        <XAxis
          dataKey="time"
          hide
          padding={{ left: PLOT_X_PAD, right: PLOT_X_PAD }}
        />
        <YAxis hide domain={[0, yMax]} />
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
      </AreaChart>
    </ResponsiveContainer>
  )

  // y축(0 제외 5개, 항상 같은 위치) — 그래프 왼쪽에 고정.
  const yAxis = (
    <div
      className="flex shrink-0 items-end justify-center"
      style={{ height: PLOT_HEIGHT }}
    >
      <div className="flex h-full flex-col justify-center gap-x6 py-x2 pr-x2">
        {yLabels.map((v, i) => (
          <div
            key={i}
            className="flex items-center justify-end"
            style={{ width: Y_LABEL_WIDTH }}
          >
            <span className="text-label-1-normal-regular text-text-secondary">
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  // 그래프 박스(좌·하 테두리) — 안쪽에 recharts 플롯.
  const graph = (
    <div
      className="overflow-hidden border-b border-l border-line-tertiary"
      style={{ height: PLOT_HEIGHT }}
    >
      {plot}
    </div>
  )

  // x축 라벨 한 줄(항상 같은 위치). scrollable이면 포인트당 고정 폭, 아니면 전폭 균등 분포.
  const xLabels = (
    <div
      className={`flex items-center px-x2 py-x1 ${
        scrollable ? 'gap-x5' : 'justify-between'
      }`}
      style={{ height: X_AXIS_HEIGHT }}
    >
      {(scrollable ? data : sampleLabels(data)).map((p, i) => (
        <span
          key={i}
          className="shrink-0 text-center text-label-1-normal-regular text-text-secondary"
          style={scrollable ? { width: Y_LABEL_WIDTH } : undefined}
        >
          {p.time}
        </span>
      ))}
    </div>
  )

  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x5">
      <DashboardSectionHeader
        title={scrollable ? '시간별 누적 시청 수' : '실시간 시청 수'}
        description="선택한 캠페인의 시간대별 시청 추이를 보여줍니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="flex min-w-0 items-start" aria-hidden="true">
        {yAxis}
        {scrollable ? (
          <ScrollArea axis="horizontal" size="small" className="min-w-0 flex-1">
            <div
              style={{
                minWidth: data.length * SCROLL_POINT_WIDTH + PLOT_X_PAD * 2,
              }}
            >
              {graph}
              {xLabels}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col">
            {graph}
            {xLabels}
          </div>
        )}
      </div>
      <p className="sr-only">
        {latest
          ? `최근 ${latest.time} 시청 수는 ${latest.viewers}명입니다.`
          : '표시할 시청 데이터가 없습니다.'}
      </p>
    </DashboardPanel>
  )
}
