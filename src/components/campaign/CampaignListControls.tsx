import { ChevronDown } from 'lucide-react'
import { Chip, Icon, SearchBar } from '@/components/ui'

/** DV-172에서 상태·검색·정렬 상태를 연결하는 목록 컨트롤의 기본 UI입니다. */
export default function CampaignListControls() {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-[6px]" aria-label="캠페인 상태 필터">
        <Chip size="large" selected>
          전체
        </Chip>
        <Chip size="large">집행 전</Chip>
        <Chip size="large">집행 중</Chip>
        <Chip size="large">집행 완료</Chip>
      </div>
      <div className="flex items-center gap-x3">
        <SearchBar
          value=""
          onChange={() => undefined}
          placeholder="캠페인명을 검색하세요"
          className="w-[307px]"
        />
        <button
          type="button"
          className="flex items-center gap-x1 px-x2 py-[6px] text-label-1-normal-bold text-text-primary"
          aria-label="캠페인 정렬"
        >
          이름순
          <Icon icon={ChevronDown} size="small" />
        </button>
      </div>
    </div>
  )
}
