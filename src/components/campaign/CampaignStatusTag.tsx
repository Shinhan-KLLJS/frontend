import type { CampaignStatus } from '@/lib/campaigns'

const STATUS_STYLE: Record<
  CampaignStatus,
  { label: string; className: string }
> = {
  before: { label: '집행 전', className: 'bg-bg-negative text-text-negative' },
  running: {
    label: '집행 중',
    className: 'bg-primary-brand-weak text-text-brand',
  },
  completed: {
    label: '집행 완료',
    className: 'bg-bg-disabled text-text-disabled',
  },
}

/** 캠페인 상태를 피그마의 작은 상태 태그로 표기합니다. */
export default function CampaignStatusTag({
  status,
}: {
  status: CampaignStatus
}) {
  const preset = STATUS_STYLE[status]

  return (
    <span
      className={[
        'inline-flex h-[24px] w-fit items-center justify-self-start rounded-x1 py-xs px-[6px] text-caption-1-medium whitespace-nowrap',
        preset.className,
      ].join(' ')}
    >
      {preset.label}
    </span>
  )
}
