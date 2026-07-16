import { Ellipsis } from 'lucide-react'
import { DropdownMenu, Icon } from '@/components/ui'
import type { Campaign } from '@/lib/campaigns'
import CampaignStatusTag from './CampaignStatusTag'

interface CampaignListTableProps {
  campaigns: Campaign[]
  onCampaignInfo: (campaign: Campaign) => void
  onCampaignMemo: (campaign: Campaign) => void
  onCampaignDelete: (campaign: Campaign) => void
}

// 캠페인명(222~, 나머지 채움) · 상태(글자 크기에 맞춤, auto) · 집행기간 180 · 매체주소 220 · 송출 90 · 작업 24
// 항목 간 gap 24px, 캠페인명↔상태만 32px(첫 칸 mr-x2 8px + gap 24px).
const GRID_CLASS =
  'grid grid-cols-[minmax(222px,1fr)_auto_180px_220px_90px_24px] items-center gap-x6'

/** 피그마 가이드의 48px 헤더·64px 행 높이를 따르며, 목록이 적어도 세로로 꽉 채운다. */
export default function CampaignListTable({
  campaigns,
  onCampaignInfo,
  onCampaignMemo,
  onCampaignDelete,
}: CampaignListTableProps) {
  return (
    <div className="w-full overflow-visible rounded-x3 border border-line-secondary bg-bg-secondary">
      <div
        className={`${GRID_CLASS} h-[48px] border-b border-line-secondary px-x5 text-label-1-normal-medium text-text-secondary`}
      >
        <span className="mr-x2">캠페인명</span>
        <span>상태</span>
        <span>집행 기간</span>
        <span>매체 주소</span>
        <span>금일/누적 송출</span>
        <span className="sr-only">작업</span>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center text-body-2-normal-regular text-text-tertiary">
          조건에 맞는 캠페인이 없습니다.
        </div>
      ) : (
        <div>
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`${GRID_CLASS} h-[64px] border-b border-line-tertiary px-x5 last:border-b-0`}
            >
              <span className="mr-x2 min-w-0 truncate text-body-2-normal-medium text-text-primary">
                {campaign.name}
              </span>
              <CampaignStatusTag status={campaign.status} />
              <span className="text-body-2-normal-regular text-text-secondary">
                {campaign.startDate} - {campaign.endDate}
              </span>
              <span className="truncate text-body-2-normal-regular text-text-secondary">
                {campaign.mediaAddress}
              </span>
              <span className="text-body-2-normal-regular text-text-secondary">
                {campaign.todayPlayCount}/{campaign.totalPlayCount}
              </span>
              <DropdownMenu
                triggerAriaLabel={`${campaign.name} 작업 메뉴`}
                menuAriaLabel={`${campaign.name} 작업`}
                className="justify-self-end"
                items={[
                  {
                    key: 'info',
                    label: '캠페인 정보 보기',
                    onSelect: () => onCampaignInfo(campaign),
                  },
                  {
                    key: 'delete',
                    label: '캠페인 삭제',
                    onSelect: () => onCampaignDelete(campaign),
                  },
                  {
                    key: 'memo',
                    label: '메모 보기',
                    onSelect: () => onCampaignMemo(campaign),
                  },
                ]}
                renderTrigger={() => <Icon icon={Ellipsis} size={20} />}
                triggerClassName="flex size-[24px] items-center justify-center rounded-x2 text-text-primary interaction-normal"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
