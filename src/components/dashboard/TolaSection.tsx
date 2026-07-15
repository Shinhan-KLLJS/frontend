import { Info } from 'lucide-react'
import tolaWave from '@/assets/dashboard/tola-wave.svg'
import tolaDim from '@/assets/dashboard/tola-dim.svg'
import tolaBody from '@/assets/dashboard/tola-body.svg'
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
      className="relative flex h-[244px] flex-col gap-x5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-x5 left-1/4 right-1/4"
      >
        <i className="absolute inset-y-0 left-0 border-l border-line-tertiary" />
        <i className="absolute inset-y-0 left-1/2 border-l border-line-tertiary" />
        <i className="absolute inset-y-0 right-0 border-l border-line-tertiary" />
      </div>
      <div className="relative z-10 grid h-[84px] grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="flex min-w-0 flex-col justify-between px-x2"
          >
            <div>
              <div className="flex items-center justify-between gap-x3">
                <span className="truncate text-label-1-normal-medium text-text-secondary">
                  {metric.label}
                </span>
                <span title={metric.description}>
                  <Icon
                    icon={Info}
                    size={16}
                    color="secondary"
                    label="지표 설명"
                  />
                </span>
              </div>
              <strong className="block text-title-3-bold text-text-primary">
                {metric.value}
              </strong>
            </div>
            <div className="flex items-center gap-x2">
              <span className="text-label-1-normal-regular text-text-secondary">
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
                  className="rounded-x1"
                >
                  {Math.abs(metric.comparison)}
                </Badge>
              )}
            </div>
          </article>
        ))}
      </div>
      <div
        className="relative h-[100px] w-full"
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
