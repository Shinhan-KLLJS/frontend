import { useCallback, useId, useLayoutEffect, useState } from 'react'
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
/** x축 라벨 텍스트 슬롯 폭(px). */
const X_LABEL_WIDTH = 40
/** x축 라벨 사이 간격(px) = spacing-x5. */
const X_LABEL_GAP = 20
/** x축 라벨 1개당 차지 폭(px) = 슬롯 40 + 간격 20. 이 폭 단위로 몇 분치를 그릴지 정한다. */
const X_LABEL_PITCH = X_LABEL_WIDTH + X_LABEL_GAP
/** 가로 스크롤 모드에서 포인트 1개당 폭(px). */
const SCROLL_POINT_WIDTH = X_LABEL_PITCH
/** 플롯 좌우 인셋(px) — 라인이 축 테두리에 붙지 않도록(Figma Graph 콘텐츠 px-x5). */
const PLOT_X_PAD = 20
/** y축 눈금 개수(0 제외) — 값이 바뀌어도 항상 5개 고정. */
const Y_TICKS = 5
/** 폭 측정 전(plotWidth=0) 임시 표시 개수 — 좁은 폭에서도 안 겹치도록 보수적으로. */
const FALLBACK_FIT_COUNT = 10

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

const LINE = 'var(--color-line-tertiary)'
const CAT_1 = 'var(--color-chart-categorical-1)'

/**
 * x축 눈금 라벨(14·Regular·secondary) — recharts가 계산한 x에 그려 포인트와 정렬한다.
 * hideFirst면 index 0(커넥터 포인트)의 라벨은 그리지 않는다.
 */
function XTick({
  x = 0,
  y = 0,
  index = 0,
  hideFirst = false,
  payload,
}: {
  x?: number
  y?: number
  index?: number
  hideFirst?: boolean
  payload?: { value?: string }
}) {
  if (!payload?.value || (hideFirst && index === 0)) return <g />
  return (
    <text
      x={x}
      y={y}
      dy={16}
      textAnchor="middle"
      fill="var(--color-text-secondary)"
      fontSize={14}
      fontWeight={400}
      letterSpacing="0.0145em"
    >
      {payload.value}
    </text>
  )
}

/**
 * 컨테이너 폭을 관찰해 반환(ResizeObserver).
 * 콜백 ref로 노드를 상태에 담아, 노드가 (조건부 렌더로) 뒤늦게 붙어도 그때 다시 측정한다.
 * (useLayoutEffect([])는 1회만 실행돼, 마운트 시점에 노드가 없으면 폭이 0으로 남는 문제를 방지)
 */
function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0)
  const [node, setNode] = useState<T | null>(null)
  const ref = useCallback((el: T | null) => setNode(el), [])
  useLayoutEffect(() => {
    if (!node) return
    setWidth(node.clientWidth)
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    ro.observe(node)
    return () => ro.disconnect()
  }, [node])
  return [ref, width] as const
}

/**
 * 실시간 시청 수 — 증권 차트 스타일 영역 차트.
 * - y축: 값이 바뀌어도 항상 5개 라벨(0 제외)이 같은 위치(Figma flexbox 실측).
 * - x축(당일): 라벨은 1분마다, 슬롯 40 + 간격 x5(20)로 고정. 그래프 폭에 들어가는 만큼만
 *   가장 최신 분부터 보여주고(폭이 넓으면 더 많이), 라벨은 실제 포인트 위치에 그려진다.
 * 기간(scrollable) 모드는 타이틀이 "시간별 누적 시청 수"로 바뀌고 포인트가 많으면 가로 스크롤한다.
 */
export default function RealtimeViewerChart({
  data,
  cutoffLabel,
  scrollable = false,
}: RealtimeViewerChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const [plotRef, plotWidth] = useElementWidth<HTMLDivElement>()

  // 당일: 그래프 폭에 들어가는 라벨 수 = floor((폭+간격)/피치). 그만큼 최신 분부터 보여준다.
  // 폭 측정 전에는 전체가 아니라 보수적 개수만(안 겹치게) — 측정되면 정확한 수로 교체된다.
  const fitCount =
    plotWidth > 0
      ? Math.max(1, Math.floor((plotWidth + X_LABEL_GAP) / X_LABEL_PITCH))
      : Math.min(data.length, FALLBACK_FIT_COUNT)
  // 윈도우 밖에 이전 데이터가 있으면, 직전 포인트 1개를 커넥터로 앞에 붙여(왼쪽 끝에 배치)
  // 라인이 축에서부터 이어져 보이게 한다. 커넥터의 점·라벨은 숨긴다.
  const hasConnector = !scrollable && plotWidth > 0 && data.length > fitCount
  const visibleData = scrollable
    ? data
    : hasConnector
      ? data.slice(-(fitCount + 1))
      : data.slice(-fitCount)
  const latest = visibleData.at(-1)

  const dataMax = visibleData.length
    ? Math.max(...visibleData.map((p) => p.viewers))
    : 0
  const yMax = niceYMax(dataMax)
  // 위에서부터 yMax, 4/5·yMax, …, 1/5·yMax (0은 축 바닥이라 라벨 생략)
  const yLabels = Array.from({ length: Y_TICKS }, (_, i) =>
    Math.round((yMax * (Y_TICKS - i)) / Y_TICKS),
  )

  const gradient = (
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CAT_1} stopOpacity={0.24} />
        <stop offset="100%" stopColor={CAT_1} stopOpacity={0} />
      </linearGradient>
    </defs>
  )

  // 커넥터 포인트(index 0)는 라인만 잇고 점은 그리지 않는다.
  const renderDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const key = `dot-${props.index}`
    if (hasConnector && props.index === 0) return <g key={key} />
    return (
      <circle
        key={key}
        cx={props.cx}
        cy={props.cy}
        r={3}
        fill={CAT_1}
        stroke="var(--color-bg-secondary)"
        strokeWidth={1.5}
      />
    )
  }

  // 시각마다 포인트(dot) + 꺾은선(직선 구간)
  const area = (
    <Area
      type="linear"
      dataKey="viewers"
      stroke={CAT_1}
      strokeWidth={2}
      fill={`url(#${gradientId})`}
      baseValue={0}
      connectNulls={false}
      dot={renderDot}
      activeDot={{ r: 4, strokeWidth: 2 }}
      isAnimationActive={false}
    />
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

  // 당일(비스크롤): 폭에 맞춰 최신 N분만, 라벨은 1분마다 실제 포인트 위치에.
  // 축선(좌·하)도 recharts로 그려 플롯 영역(212px)에만 L자로 표시.
  if (!scrollable) {
    return (
      <DashboardPanel className="flex h-[328px] flex-col gap-x5">
        <DashboardSectionHeader
          title="실시간 시청 수"
          description="선택한 캠페인의 시간대별 시청 추이를 보여줍니다."
          cutoffLabel={cutoffLabel}
        />
        <div className="flex min-w-0 items-start" aria-hidden="true">
          {yAxis}
          <div
            ref={plotRef}
            className="min-w-0 flex-1"
            style={{ height: PLOT_HEIGHT + X_AXIS_HEIGHT }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={visibleData}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                {gradient}
                <YAxis
                  domain={[0, yMax]}
                  width={1}
                  tick={false}
                  tickLine={false}
                  axisLine={{ stroke: LINE }}
                />
                <XAxis
                  dataKey="time"
                  height={X_AXIS_HEIGHT}
                  axisLine={{ stroke: LINE }}
                  tickLine={false}
                  interval={0}
                  // 커넥터가 있으면 왼쪽 끝(0)까지 라인을 잇고, 없으면 첫 포인트를 살짝 띄운다.
                  padding={{ left: hasConnector ? 0 : PLOT_X_PAD, right: PLOT_X_PAD }}
                  tick={<XTick hideFirst={hasConnector} />}
                />
                {area}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="sr-only">
          {latest
            ? `최근 ${latest.time} 시청 수는 ${latest.viewers}명입니다.`
            : '표시할 시청 데이터가 없습니다.'}
        </p>
      </DashboardPanel>
    )
  }

  // 기간(스크롤): 플롯은 포인트당 고정 폭으로 가로 스크롤, y축은 왼쪽에 고정.
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
        {area}
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <DashboardPanel className="flex h-[328px] flex-col gap-x5">
      <DashboardSectionHeader
        title="시간별 누적 시청 수"
        description="선택한 캠페인의 시간대별 시청 추이를 보여줍니다."
        cutoffLabel={cutoffLabel}
      />
      <div className="flex min-w-0 items-start" aria-hidden="true">
        {yAxis}
        <ScrollArea axis="horizontal" size="small" className="min-w-0 flex-1">
          <div
            style={{
              // 점 간격 = SCROLL_POINT_WIDTH가 되도록 (N-1)칸 + 좌우 인셋(PLOT_X_PAD).
              // N칸으로 잡으면 recharts 점 간격이 60·N/(N-1)로 커져 라벨(고정 60)과 어긋난다.
              minWidth:
                Math.max(0, data.length - 1) * SCROLL_POINT_WIDTH +
                PLOT_X_PAD * 2,
            }}
          >
            <div
              className="overflow-hidden border-b border-l border-line-tertiary"
              style={{ height: PLOT_HEIGHT }}
            >
              {plot}
            </div>
            {/* 라벨 행 — 점과 같은 원점(px 없음)·같은 피치(폭40+gap20=60)로 점 x와 정렬 */}
            <div
              className="flex items-center gap-x5 py-x1"
              style={{ height: X_AXIS_HEIGHT }}
            >
              {data.map((p, i) => (
                <span
                  key={i}
                  className="shrink-0 text-center text-label-1-normal-regular text-text-secondary"
                  style={{ width: X_LABEL_WIDTH }}
                >
                  {p.time}
                </span>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
      <p className="sr-only">
        {latest
          ? `최근 ${latest.time} 시청 수는 ${latest.viewers}명입니다.`
          : '표시할 시청 데이터가 없습니다.'}
      </p>
    </DashboardPanel>
  )
}
