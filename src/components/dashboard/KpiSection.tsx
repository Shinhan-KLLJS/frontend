import type { LucideIcon } from 'lucide-react'
import {
  ChartNoAxesColumnIncreasing,
  Clock3,
  Play,
  PlayOff,
} from 'lucide-react'
import type { ReactNode } from 'react'
import kpiObject from '@/assets/dashboard/kpi-object.png'
import { Icon, Tooltip } from '@/components/ui'
import { formatCutoffLabel } from '@/lib/dashboardTime'

export interface KpiMetric {
  key: string
  label: string
  value: string
  guide?: string
  icon: LucideIcon
}

export interface KpiSectionProps {
  metrics: KpiMetric[]
  toolbar?: ReactNode
  estimatedDowntime?: boolean
  /** 집계 기준 시각 라벨(예: "14:37 기준") — 지표 아이콘 호버 툴팁 */
  cutoffLabel?: string
}

export const DEFAULT_KPI_ICONS = {
  currentPlayCount: Play,
  progressRate: ChartNoAxesColumnIncreasing,
  totalPlayTime: Clock3,
  downtime: PlayOff,
} as const

/** 캠페인 송출 상태를 한눈에 보여주는 KPI 카드 묶음입니다. */
export default function KpiSection({
  metrics,
  toolbar,
  estimatedDowntime = false,
  cutoffLabel,
}: KpiSectionProps) {
  return (
    <section aria-label="캠페인 핵심 지표" className="relative min-w-0 p-x5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-x5 bg-[linear-gradient(107deg,var(--blue-50),var(--blue-100))]">
        <div className="absolute inset-y-[-5%] right-0 aspect-[960/224] opacity-50">
          <img
            src={kpiObject}
            alt=""
            aria-hidden="true"
            className="absolute left-[11%] top-[-8%] h-[189%] w-[132%] max-w-none"
          />
        </div>
      </div>
      <div className="relative flex min-w-0 flex-col gap-x5">
        {toolbar}
        <div className="grid min-w-0 grid-cols-4 gap-x5">
          {metrics.map((metric) => (
            <article
              key={metric.key}
              className="flex aspect-[2.25/1] min-w-0 items-start justify-between rounded-x3 bg-bg-secondary p-x5"
            >
              <div className="flex h-full min-w-0 flex-col justify-between">
                <span className="text-label-1-normal-regular text-text-secondary">
                  {metric.label}
                </span>
                <strong className="truncate text-title-3-medium text-text-primary">
                  {metric.value}
                  {metric.guide && <span>{metric.guide}</span>}
                </strong>
              </div>
              <Tooltip content={cutoffLabel ?? formatCutoffLabel()}>
                <Icon icon={metric.icon} size="medium" color="caption" />
              </Tooltip>
            </article>
          ))}
        </div>
        {estimatedDowntime && (
          <p className="sr-only">
            다운타임은 실제 로그가 아닌 무중단 송출 추정 기준입니다.
          </p>
        )}
      </div>
    </section>
  )
}
