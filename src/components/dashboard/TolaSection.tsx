import { Info } from 'lucide-react'
import tolaFlow from '@/assets/dashboard/tola-flow.svg'
import { Badge, Icon } from '@/components/ui'
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
}

/** 유동인구가 시청으로 전환되는 TOLA 퍼널 지표를 표현합니다. */
export default function TolaSection({ metrics }: TolaSectionProps) {
  return (
    <DashboardPanel
      aria-label="TOLA 전환 지표"
      className="relative h-[244px] p-0"
    >
      <img
        src={tolaFlow}
        alt="유동인구에서 노출인구로 좁아지는 전환 흐름"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[118px] w-full"
      />
      <div className="relative z-10 grid h-full grid-cols-4">
        {metrics.map((metric, index) => (
          <article
            key={metric.key}
            className={[
              'flex min-w-0 flex-col gap-x2 px-x7 pt-x5',
              index > 0 ? 'border-l border-line-tertiary' : '',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-x2">
              <span className="truncate text-label-1-normal-regular text-text-secondary">
                {metric.label}
              </span>
              <span title={metric.description}>
                <Icon icon={Info} size={16} color="secondary" label="지표 설명" />
              </span>
            </div>
            <strong className="text-title-3-bold text-text-primary">
              {metric.value}
            </strong>
            <div className="flex items-center gap-x2">
              <span className="text-label-1-normal-regular text-text-tertiary">
                어제 대비
              </span>
              {metric.comparison === undefined ? (
                <span className="text-label-1-normal-medium text-text-caption">
                  -
                </span>
              ) : (
                <Badge
                  size="small"
                  direction={metric.comparison >= 0 ? 'up' : 'down'}
                >
                  {Math.abs(metric.comparison)}
                </Badge>
              )}
            </div>
          </article>
        ))}
      </div>
    </DashboardPanel>
  )
}
