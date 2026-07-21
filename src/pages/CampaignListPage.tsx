import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, SquarePen } from 'lucide-react'
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
import { ROUTES } from '@/lib/routes'
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
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null,
  )

  const campaigns = useCampaignList(
    data?.campaigns ?? [],
    filter,
    keyword,
    sort,
  )

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
    <section className="flex min-h-full flex-col bg-bg-secondary">
      {/* 헤더 — p-x5, space-between */}
      <header className="flex items-center justify-between p-x5">
        <div className="flex items-center gap-[6px]">
          <h1 className="text-title-2-medium text-text-primary">
            {data.teamName}
          </h1>
          <Button
            iconOnly
            variant="ghost"
            color="secondary"
            size="small"
            leadingIcon={SquarePen}
            aria-label="팀 이름 편집"
          />
        </div>
        <div className="flex items-center gap-[6px]">
          <Button
            variant="line"
            color="secondary"
            size="large"
          >
            리포트 추출하기
          </Button>
          <Button
            variant="default"
            color="primary"
            size="large"
            leadingIcon={Plus}
            className="pl-x5"
            onClick={() => navigate(ROUTES.campaignsNew)}
          >
            캠페인 등록하기
          </Button>
        </div>
      </header>

      {/* 컨텐츠 — px-x5, gap-x5 */}
      <div className="flex flex-1 flex-col gap-x5 px-x5 pb-x5">
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
          onCampaignMemo={(campaign) => setMemoCampaignId(Number(campaign.id))}
          onCampaignDelete={setCampaignToDelete}
        />
      </div>

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
