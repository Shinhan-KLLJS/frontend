import { Info } from 'lucide-react'
import { Icon, Tooltip } from '@/components/ui'
import { formatCutoffLabel } from '@/lib/dashboardTime'

export interface DashboardSectionHeaderProps {
  title: string
  /** 아이콘 aria-label(접근성) */
  description: string
  /**
   * 데이터 집계 기준 시각 라벨(예: "14:37 기준"). 실 API 연결 시 주입.
   * 없으면(Storybook·로딩 중) 현재 시각을 표기해 항상 "HH:mm 기준"이 보인다.
   */
  cutoffLabel?: string
}

/** 차트 카드의 제목과 (i) 아이콘 호버 툴팁을 동일한 규격으로 표시합니다. */
export default function DashboardSectionHeader({
  title,
  description,
  cutoffLabel,
}: DashboardSectionHeaderProps) {
  return (
    <header className="flex h-[28px] w-full items-center justify-between gap-x4">
      <h2 className="text-heading-2-bold text-text-primary">{title}</h2>
      <Tooltip content={cutoffLabel ?? formatCutoffLabel()}>
        <Icon icon={Info} size={16} color="secondary" label={description} />
      </Tooltip>
    </header>
  )
}
