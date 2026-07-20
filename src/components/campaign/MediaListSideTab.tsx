import { ChevronRight } from 'lucide-react'
import { Icon } from '@/components/ui'

export interface MediaListSideTabProps {
  /** 목록이 펼쳐진 상태 — true면 접기(◀), false면 펼치기(▶) */
  open: boolean
  onToggle: () => void
  className?: string
}

/**
 * 매체 목록 패널을 접고 펴는 사이드 탭 (Figma 2092-35779).
 * 쉐브론은 아이콘 교체 없이 transition-transform 회전으로 좌/우 전환한다.
 */
export default function MediaListSideTab({
  open,
  onToggle,
  className,
}: MediaListSideTabProps) {
  return (
    <button
      type="button"
      aria-label={open ? '매체 목록 접기' : '매체 목록 펼치기'}
      aria-expanded={open}
      onClick={onToggle}
      className={[
        'flex cursor-pointer items-center rounded-br-x2 rounded-tr-x2',
        'border-b border-r border-t border-line-secondary bg-bg-secondary',
        'px-x1 py-x5 text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon
        icon={ChevronRight}
        size="medium"
        className={`transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}
