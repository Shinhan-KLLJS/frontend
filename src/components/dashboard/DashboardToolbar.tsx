import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DatePicker, DateTrigger, DropdownMenu, Icon } from '@/components/ui'
import type { DateRange, DropdownMenuItem } from '@/components/ui'

export interface CampaignOption {
  id: string
  name: string
}

export interface DashboardToolbarProps {
  campaigns: CampaignOption[]
  selectedId: string
  onCampaignChange: (id: string) => void
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

/** 캠페인과 조회 기간을 로컬 상태로 선택하는 대시보드 도구 모음입니다. */
export default function DashboardToolbar({
  campaigns,
  selectedId,
  onCampaignChange,
  dateRange,
  onDateRangeChange,
}: DashboardToolbarProps) {
  const [dateOpen, setDateOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange>(dateRange)
  const selected = campaigns.find(({ id }) => id === selectedId)
  const menuItems: DropdownMenuItem[] = campaigns.map(({ id, name }) => ({
    key: id,
    label: name,
    onSelect: () => onCampaignChange(id),
  }))

  const openDatePicker = () => {
    setDraftRange(dateRange)
    setDateOpen(true)
  }

  return (
    <div className="relative z-20 flex h-[48px] min-w-0 items-center justify-between gap-x5">
      <DropdownMenu
        items={menuItems}
        align="start"
        menuAriaLabel="캠페인 목록"
        triggerAriaLabel="캠페인 선택"
        className="min-w-0 flex-1"
        triggerClassName="flex w-full min-w-0 items-center gap-x2 text-left"
        renderTrigger={(open) => (
          <>
            <span className="truncate text-title-3-bold text-text-primary">
              {selected?.name ?? '캠페인을 선택해 주세요'}
            </span>
            <Icon
              icon={open ? ChevronUp : ChevronDown}
              size="large"
              color="secondary"
            />
          </>
        )}
      />
      <DateTrigger
        value={dateRange}
        open={dateOpen}
        className="h-[48px] shrink-0"
        onClick={() => (dateOpen ? setDateOpen(false) : openDatePicker())}
      />
      {dateOpen && (
        <DatePicker
          key={`${dateRange.start?.getTime()}-${dateRange.end?.getTime()}`}
          value={draftRange}
          onChange={setDraftRange}
          onClose={() => setDateOpen(false)}
          onApply={(range) => {
            onDateRangeChange(range)
            setDateOpen(false)
          }}
          className="absolute right-0 top-[56px] z-50"
        />
      )}
    </div>
  )
}
