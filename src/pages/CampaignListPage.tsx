import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus } from 'lucide-react'
import { Button, LoadingSpinner, useToast } from '@/components/ui'
import CampaignListControls from '@/components/campaign/CampaignListControls'
import CampaignDeleteModal from '@/components/campaign/CampaignDeleteModal'
import CampaignInfoModal from '@/components/campaign/CampaignInfoModal'
import CampaignMemoModal from '@/components/campaign/CampaignMemoModal'
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const teamId = user?.teamId

  const { data, isPending, isError, refetch } = useTeamCampaigns(teamId)
  const deleteCampaign = useDeleteCampaign(teamId)

  const [filter, setFilter] = useState<CampaignFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<CampaignSort>('name')
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  )
  const [memoCampaignId, setMemoCampaignId] = useState<number | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)

  const campaigns = useCampaignList(data?.campaigns ?? [], filter, keyword, sort)

  const showPreparationToast = () => toast('다음 작업에서 기능을 연결합니다.')
  const confirmCampaignDelete = () => {
    if (!campaignToDelete) return
    const campaign = campaignToDelete
    deleteCampaign.mutate(Number(campaign.id), {
      onSuccess: () => {
        if (selectedCampaignId === Number(campaign.id))
          setSelectedCampaignId(null)
        if (memoCampaignId === Number(campaign.id)) setMemoCampaignId(null)
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

  // teamId가 없으면 목록 쿼리가 비활성(enabled=false)이라 isPending이 계속 true → 무한 스피너.
  // 팀 미소속 사용자는 라우터가 /welcome으로 보내지만, 방어적으로 안내 상태를 렌더한다.
  if (teamId == null) {
    return (
      <section className="flex min-h-full items-center justify-center bg-bg-secondary p-x5">
        <p className="text-body-1-normal-regular text-text-secondary">
          소속된 팀이 없습니다.
        </p>
      </section>
    )
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
    <section className="flex min-h-full flex-col gap-x5 bg-bg-secondary p-x5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-[6px]">
          <h1 className="text-title-2-medium text-text-primary">
            {data.teamName}
          </h1>
          <Button
            iconOnly
            variant="ghost"
            color="secondary"
            size="small"
            leadingIcon={Pencil}
            aria-label="팀 이름 편집"
            onClick={showPreparationToast}
          />
        </div>
        <div className="flex items-center gap-x2">
          <Button
            variant="line"
            color="secondary"
            size="large"
            onClick={showPreparationToast}
          >
            리포트 추출
          </Button>
          <Button
            size="large"
            leadingIcon={Plus}
            onClick={() => navigate('/campaigns/new')}
          >
            캠페인 등록
          </Button>
        </div>
      </header>

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
        onCampaignInfo={(campaign) => setSelectedCampaignId(Number(campaign.id))}
        onCampaignMemo={(campaign) => setMemoCampaignId(Number(campaign.id))}
        onCampaignDelete={setCampaignToDelete}
      />

      <CampaignInfoModal
        teamId={teamId}
        campaignId={selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
      />
      <CampaignMemoModal
        teamId={teamId}
        campaignId={memoCampaignId}
        onClose={() => setMemoCampaignId(null)}
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
