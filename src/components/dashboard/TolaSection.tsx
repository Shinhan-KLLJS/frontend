import { Info } from 'lucide-react'
import tolaWave from '@/assets/dashboard/tola-wave.svg'
import tolaDim from '@/assets/dashboard/tola-dim.svg'
import tolaBody from '@/assets/dashboard/tola-body.svg'
import { Badge, Icon, Tooltip } from '@/components/ui'
import { formatCutoffLabel } from '@/lib/dashboardTime'
import DashboardPanel from './DashboardPanel'

export interface TolaMetric {
  key: string
  label: string
  value: string
  comparison?: number
  description: string
}

export interface TolaSectionProps {
  metrics: TolaMetric[]
  /** 데이터 집계 기준 시각 "HH:mm" — 툴팁에 "HH:mm 기준"으로 표기 */
  cutoffLabel?: string
  /** '어제 대비' 증감 표시 여부 — 기간 조회 시 false로 숨기고 빈 칸을 유지한다. 기본 true */
  showComparison?: boolean
}

/** 유동인구가 시청으로 전환되는 TOLA 퍼널 지표를 표현합니다. */
export default function TolaSection({
  metrics,
  cutoffLabel,
  showComparison = true,
}: TolaSectionProps) {
  return (
    <DashboardPanel
      aria-label="TOLA 전환 지표"
      className="relative flex h-[244px] flex-col gap-x5"
    >
      {/* 4개 세로 구분선 — 각 지표 칸(그리드 4열)의 왼쪽 경계에 맞춤, 높이 160px */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-x5 top-x5 h-[160px]"
      >
        <i className="absolute inset-y-0 left-0 border-l border-line-tertiary" />
        <i className="absolute inset-y-0 left-1/4 border-l border-line-tertiary" />
        <i className="absolute inset-y-0 left-1/2 border-l border-line-tertiary" />
        <i className="absolute inset-y-0 left-3/4 border-l border-line-tertiary" />
      </div>
      <div className="relative z-10 grid h-[84px] grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="flex min-w-0 flex-col justify-between pl-x2 pr-x4 "
          >
            <div>
              <div className="flex items-center justify-between gap-x3">
                <span className="truncate text-label-1-normal-medium text-text-secondary">
                  {metric.label}
                </span>
                <Tooltip
                  content={
                    cutoffLabel ? `${cutoffLabel} 기준` : formatCutoffLabel()
                  }
                >
                  <Icon
                    icon={Info}
                    size={16}
                    color="secondary"
                    label={`${metric.label} 데이터 집계 기준 시각`}
                  />
                </Tooltip>
              </div>
              <strong className="block text-title-3-bold text-text-primary">
                {metric.value}
              </strong>
            </div>
            {/* 기간 조회 시(showComparison=false) 증감 행은 비우되 높이는 유지해 퍼널 정렬을 고정한다 */}
            <div className="flex h-[24px] items-center gap-x2">
              {showComparison && (
                <>
                  <span className="text-label-1-normal-regular text-text-secondary">
                    어제 대비
                  </span>
                  {/* 증감이 없거나 값이 0(문자열 "0.0" 포함)이면 뱃지 대신 '-' 표기.
                      나머지는 백엔드가 준 값을 그대로 노출(프론트 추가 포맷 없음). */}
                  {metric.comparison == null ||
                  Number(metric.comparison) === 0 ? (
                    <span className="text-label-1-normal-medium text-text-caption">
                      -
                    </span>
                  ) : (
                    <Badge
                      size="small"
                      direction={metric.comparison >= 0 ? 'up' : 'down'}
                      className="rounded-x1"
                    >
                      {Math.abs(metric.comparison)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <div
        className="relative h-[100px] w-full"
        role="img"
        aria-label="유동인구에서 노출인구로 좁아지는 전환 흐름"
      >
        <img src={tolaWave} alt="" className="absolute inset-0 h-full w-full" />
        <img
          src={tolaDim}
          alt=""
          className="absolute inset-y-[7%] left-0 h-[86%] w-full"
        />
        <img
          src={tolaBody}
          alt=""
          className="absolute inset-y-[14%] left-0 h-[72%] w-full"
        />
      </div>
    </DashboardPanel>
  )
}
