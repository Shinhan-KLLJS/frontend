import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button, Icon, LoadingSpinner, useToast } from '@/components/ui'
import CampaignListControls from '@/components/campaign/CampaignListControls'
import CampaignDeleteModal from '@/components/campaign/CampaignDeleteModal'
import CampaignInfoModal from '@/components/campaign/CampaignInfoModal'
import CampaignListTable from '@/components/campaign/CampaignListTable'
import { useAuth } from '@/lib/auth'
import {
  useDeleteCampaign,
  useTeamCampaigns,
  type Campaign,
} from '@/lib/campaigns'
import { CampaignApiError } from '@/lib/campaign'
import { useCampaignList } from '@/hooks/useCampaignList'
import type { CampaignFilter, CampaignSort } from '@/hooks/useCampaignList'

/** 팀 캠페인 목록 화면 — 조회·정보 보기·삭제 API 연결 (DV-186). */
export default function CampaignListPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const teamId = user?.teamId

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useTeamCampaigns(teamId)
  const deleteCampaign = useDeleteCampaign(teamId)

  const [filter, setFilter] = useState<CampaignFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<CampaignSort>('name')
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  )
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [reportMode, setReportMode] = useState(false)
  const [reportCampaignId, setReportCampaignId] = useState<string | null>(null)

  const campaigns = useCampaignList(data?.campaigns ?? [], filter, keyword, sort)

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
    deleteCampaign.mutate(Number(campaign.id), {
      onSuccess: () => {
        if (reportCampaignId === campaign.id) setReportCampaignId(null)
        if (selectedCampaignId === Number(campaign.id))
          setSelectedCampaignId(null)
        setCampaignToDelete(null)
        toast(`${campaign.name} 캠페인을 삭제했습니다.`)
      },
      onError: (error) => {
        const message =
          error instanceof CampaignApiError
            ? error.message
            : '캠페인을 삭제하지 못했습니다.'
        toast(message)
      },
    })
  }

  if (isPending) {
    return (
      <section className="flex min-h-full items-center justify-center bg-bg-secondary p-x5">
        <LoadingSpinner progress={0} showLabel={false} />
      </section>
    )
  }

  if (isError) {
    return (
      <section className="flex min-h-full flex-col items-center justify-center gap-x4 bg-bg-secondary p-x5">
        <p className="text-body-1-normal-regular text-text-secondary">
          캠페인 목록을 불러오지 못했습니다.
        </p>
        <Button
          variant="line"
          color="secondary"
          size="medium"
          onClick={() => refetch()}
        >
          다시 시도
        </Button>
      </section>
    )
  }

  return (
    <section className="min-h-full bg-bg-secondary p-x5">
      <header className="flex items-center justify-between p-x5">
        <div className="flex items-center gap-[6px]">
          <h1 className="text-title-2-medium text-text-primary">
            {data.teamName}
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
              <Button disabled={!reportCampaignId} onClick={extractReport}>
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
          onCampaignInfo={(campaign) =>
            setSelectedCampaignId(Number(campaign.id))
          }
          onCampaignDelete={setCampaignToDelete}
          reportMode={reportMode}
          selectedReportCampaignId={reportCampaignId}
          onReportSelect={toggleReportCampaign}
        />
      </div>
      <CampaignInfoModal
        teamId={teamId}
        campaignId={selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
      />
      <CampaignDeleteModal
        campaign={campaignToDelete}
        pending={deleteCampaign.isPending}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={confirmCampaignDelete}
      />
    </section>
  )
}
