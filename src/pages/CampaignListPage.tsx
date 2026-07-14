import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button, Icon, useToast } from '@/components/ui'
import CampaignListControls from '@/components/campaign/CampaignListControls'
import CampaignListTable from '@/components/campaign/CampaignListTable'
import { CAMPAIGN_FIXTURES } from '@/lib/campaigns'
import { useCampaignList } from '@/hooks/useCampaignList'
import type { CampaignFilter, CampaignSort } from '@/hooks/useCampaignList'

/** API 연결 전 피그마 기준 캠페인 목록의 기본 화면을 제공합니다. */
export default function CampaignListPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<CampaignFilter>('all')
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<CampaignSort>('name')
  const campaigns = useCampaignList(CAMPAIGN_FIXTURES, filter, keyword, sort)
  const showPreparationToast = () => toast('다음 작업에서 기능을 연결합니다.')

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
          <Button variant="line" color="secondary" onClick={showPreparationToast}>
            리포트 추출
          </Button>
          <Button leadingIcon={Plus} onClick={showPreparationToast}>
            캠페인 등록
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-x5 p-x5">
        <CampaignListControls
          campaigns={CAMPAIGN_FIXTURES}
          filter={filter}
          keyword={keyword}
          sort={sort}
          onFilterChange={setFilter}
          onKeywordChange={setKeyword}
          onSortChange={setSort}
        />
        <CampaignListTable campaigns={campaigns} />
      </div>
    </section>
  )
}
