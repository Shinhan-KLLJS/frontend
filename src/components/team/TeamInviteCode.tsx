import { Copy, Link } from 'lucide-react'
import { Icon } from '@/components/ui'

interface TeamInviteCodeProps {
  teamCode: string
  onCopy: () => void
}

/** 팀 초대 코드를 표시하고 클립보드 복사 행동을 제공한다. */
export default function TeamInviteCode({
  teamCode,
  onCopy,
}: TeamInviteCodeProps) {
  return (
    <div className="flex flex-col gap-x2">
      <span className="text-label-1-normal-bold text-text-secondary">
        팀 코드
      </span>
      <div className="flex items-center gap-x1 rounded-x3 border border-line-secondary bg-bg-secondary px-x4 py-x3">
        <Icon icon={Link} size="large" color="primary" />
        <span className="min-w-0 flex-1 truncate px-x1 text-body-1-normal-regular text-text-primary">
          {teamCode}
        </span>
        <button
          type="button"
          aria-label="팀 코드 복사"
          onClick={onCopy}
          className="cursor-pointer rounded-x1 text-text-primary interaction-normal"
        >
          <Icon icon={Copy} size="large" />
        </button>
      </div>
    </div>
  )
}
