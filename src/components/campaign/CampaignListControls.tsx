import { ChevronDown } from 'lucide-react'
import { Chip, DropdownMenu, Icon, SearchBar } from '@/components/ui'
import type { CampaignFilter, CampaignSort } from '@/hooks/useCampaignList'

interface CampaignListControlsProps {
  filter: CampaignFilter
  keyword: string
  sort: CampaignSort
  onFilterChange: (filter: CampaignFilter) => void
  onKeywordChange: (keyword: string) => void
  onSortChange: (sort: CampaignSort) => void
}

const FILTERS: { value: CampaignFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'before', label: '집행 전' },
  { value: 'running', label: '집행 중' },
  { value: 'completed', label: '집행 완료' },
]

const SORTS: { value: CampaignSort; label: string }[] = [
  { value: 'name', label: '이름순' },
  { value: 'latest', label: '집행 최신순' },
  { value: 'oldest', label: '집행 오래된순' },
]

/** 상태 칩, 이름 검색, 정렬 메뉴를 캠페인 목록 상태에 연결합니다. */
export default function CampaignListControls({
  filter,
  keyword,
  sort,
  onFilterChange,
  onKeywordChange,
  onSortChange,
}: CampaignListControlsProps) {
  const selectedSort = SORTS.find((item) => item.value === sort) ?? SORTS[0]

  return (
    <div className="flex w-full items-center justify-between">
      <div
        className="flex items-center gap-[6px]"
        aria-label="캠페인 상태 필터"
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.value}
            size="large"
            selected={filter === item.value}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </Chip>
        ))}
      </div>
      <div className="flex items-center gap-x3">
        <SearchBar
          value={keyword}
          onChange={onKeywordChange}
          placeholder="캠페인명을 검색하세요"
          className="w-[307px] [&>div:first-child]:h-[40px] [&>div:first-child]:py-x2"
        />
        <DropdownMenu
          className="shrink-0"
          triggerAriaLabel="캠페인 정렬"
          menuAriaLabel="캠페인 정렬 옵션"
          items={SORTS.map((item) => ({
            key: item.value,
            label: item.label,
            onSelect: () => onSortChange(item.value),
          }))}
          renderTrigger={() => (
            <span className="flex h-[40px] items-center gap-x1 whitespace-nowrap rounded-x2-5 px-x3 text-label-1-normal-bold text-text-primary interaction-normal">
              {selectedSort.label}
              <Icon icon={ChevronDown} size="small" />
            </span>
          )}
        />
      </div>
    </div>
  )
}
