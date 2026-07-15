import { Info } from 'lucide-react'
import { Icon } from '@/components/ui'

export interface DashboardSectionHeaderProps {
  title: string
  description: string
}

/** 차트 카드의 제목과 보조 설명을 동일한 규격으로 표시합니다. */
export default function DashboardSectionHeader({
  title,
  description,
}: DashboardSectionHeaderProps) {
  return (
    <header className="flex items-center gap-x2">
      <h2 className="text-headline-1-bold text-text-primary">{title}</h2>
      <span title={description}>
        <Icon icon={Info} size={16} color="secondary" label="지표 설명" />
      </span>
    </header>
  )
}
