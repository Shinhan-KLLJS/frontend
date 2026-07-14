import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button, Icon, useToast } from '@/components/ui'
import CampaignListControls from '@/components/campaign/CampaignListControls'
import CampaignDeleteModal from '@/components/campaign/CampaignDeleteModal'
import CampaignInfoModal from '@/components/campaign/CampaignInfoModal'
import CampaignListTable from '@/components/campaign/CampaignListTable'
import { CAMPAIGN_FIXTURES } from '@/lib/campaigns'
import type { Campaign } from '@/lib/campaigns'
import { useCampaignList } from '@/hooks/useCampaignList'
import type { CampaignFilter, CampaignSort } from '@/hooks/useCampaignList'

/** API 연결 전 피그마 기준 캠페인 목록의 기본 화면을 제공합니다. */
export default function CampaignListPage() {
  const { toast } = useToast()
  const [campaignItems, setCampaignItems] = useState(CAMPAIGN_FIXTURES)
  const [filter, setFilter] = useState<CampaignFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<CampaignSort>('name')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [reportMode, setReportMode] = useState(false)
  const [reportCampaignId, setReportCampaignId] = useState<string | null>(null)
  const campaigns = useCampaignList(campaignItems, filter, keyword, sort)
  const showPreparationToast = () => toast('다음 작업에서 기능을 연결합니다.')
  const toggleReportCampaign = (campaignId: string, checked: boolean) => {
    // 새 항목을 선택하면 기존 대상은 교체하고, 선택 항목을 다시 누르면 해제합니다.
    setReportCampaignId(checked ? campaignId : null)
  }
  const closeReportMode = () => {
    setReportCampaignId(null)
    setReportMode(false)
  }
  const extractReport = () => {
    toast('선택한 캠페인의 리포트 추출을 시작했습니다.')
    closeReportMode()
  }
  const confirmCampaignDelete = () => {
    if (!campaignToDelete) return
    const campaign = campaignToDelete
    setCampaignItems((items) => items.filter((item) => item.id !== campaign.id))
    if (reportCampaignId === campaign.id) setReportCampaignId(null)
    if (selectedCampaign?.id === campaign.id) setSelectedCampaign(null)
    setCampaignToDelete(null)
    toast(`${campaign.name} 캠페인을 삭제했습니다.`)
  }

  return (
    <section className="min-h-full bg-bg-secondary p-x5">
      <header className="flex items-center justify-between p-x5">
        <div className="flex items-center gap-[6px]">
          <h1 className="text-title-2-medium text-text-primary">
            신한 KLLJS 딥비전스 옥외 광고 3팀
          </h1>
          <button
            type="button"
            aria-label="팀 이름 편집"
            onClick={showPreparationToast}
            className="cursor-pointer pb-x3 text-text-primary"
          >
            <Icon icon={Pencil} size="small" />
          </button>
        </div>
        <div className="flex items-center gap-[6px]">
          {reportMode ? (
            <>
              <Button variant="line" color="secondary" onClick={closeReportMode}>
                취소
              </Button>
              <Button
                disabled={!reportCampaignId}
                onClick={extractReport}
              >
                추출하기
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="line"
                color="secondary"
                onClick={() => setReportMode(true)}
              >
                리포트 추출
              </Button>
              <Button leadingIcon={Plus} onClick={showPreparationToast}>
                캠페인 등록
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-x5 p-x5">
        <CampaignListControls
          filter={filter}
          keyword={keyword}
          sort={sort}
          onFilterChange={setFilter}
          onKeywordChange={setKeyword}
          onSortChange={setSort}
        />
        <CampaignListTable
          campaigns={campaigns}
          onCampaignInfo={setSelectedCampaign}
          onCampaignDelete={setCampaignToDelete}
          reportMode={reportMode}
          selectedReportCampaignId={reportCampaignId}
          onReportSelect={toggleReportCampaign}
        />
      </div>
      <CampaignInfoModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
      <CampaignDeleteModal
        campaign={campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={confirmCampaignDelete}
      />
    </section>
  )
}
