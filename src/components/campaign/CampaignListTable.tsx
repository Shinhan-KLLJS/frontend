import { Ellipsis } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Campaign } from '@/lib/campaigns'
import CampaignStatusTag from './CampaignStatusTag'

interface CampaignListTableProps {
  campaigns: Campaign[]
}

const GRID_CLASS =
  'grid grid-cols-[minmax(0,1fr)_60px_180px_220px_90px_24px] items-center gap-x6'

/** 피그마 가이드의 48px 헤더와 64px 행 높이를 따르는 캠페인 표입니다. */
export default function CampaignListTable({ campaigns }: CampaignListTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-x3 border border-line-secondary bg-bg-secondary">
      <div
        className={`${GRID_CLASS} h-[48px] border-b border-line-secondary px-x5 text-label-1-normal-bold text-text-secondary`}
      >
        <span>캠페인명</span>
        <span>상태</span>
        <span>집행기간</span>
        <span>매체 주소</span>
        <span className="text-right">오늘/총 송출</span>
        <span className="sr-only">작업</span>
      </div>

      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className={`${GRID_CLASS} h-[64px] border-b border-line-tertiary px-x5 last:border-b-0`}
        >
          <span className="truncate text-body-2-normal-medium text-text-primary">
            {campaign.name}
          </span>
          <CampaignStatusTag status={campaign.status} />
          <span className="text-label-1-normal-regular text-text-secondary">
            {campaign.startDate} - {campaign.endDate}
          </span>
          <span className="truncate text-label-1-normal-regular text-text-secondary">
            {campaign.mediaAddress}
          </span>
          <span className="text-right text-label-1-normal-regular text-text-secondary">
            {campaign.todayPlayCount}/{campaign.totalPlayCount}
          </span>
          <Button
            iconOnly
            variant="ghost"
            color="secondary"
            size="small"
            leadingIcon={Ellipsis}
            aria-label={`${campaign.name} 작업 메뉴`}
            className="justify-self-end"
          />
        </div>
      ))}
    </div>
  )
}
