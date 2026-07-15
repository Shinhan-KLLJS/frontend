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
  /** 선택 가능 날짜 범위(캠페인 집행기간). 벗어난 날짜는 DatePicker에서 비활성. */
  minDate?: Date
  maxDate?: Date
}

/** 캠페인과 조회 기간을 선택하는 대시보드 도구 모음입니다. */
export default function DashboardToolbar({
  campaigns,
  selectedId,
  onCampaignChange,
  dateRange,
  onDateRangeChange,
  minDate,
  maxDate,
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
        className="w-[462px] min-w-0"
        triggerClassName="flex w-[462px] min-w-0 items-center text-left"
        renderTrigger={(open) => (
          <>
            <span className="w-[430px] truncate text-title-1-medium text-text-primary">
              {selected?.name ?? '캠페인을 선택해 주세요'}
            </span>
            <Icon
              icon={open ? ChevronUp : ChevronDown}
              size={32}
              color="secondary"
            />
          </>
        )}
      />
      <DateTrigger
        value={dateRange}
        open={dateOpen}
        className="h-[48px] min-w-[164px] shrink-0 justify-center px-x4 py-x3"
        onClick={() => (dateOpen ? setDateOpen(false) : openDatePicker())}
      />
      {dateOpen && (
        <DatePicker
          key={`${dateRange.start?.getTime()}-${dateRange.end?.getTime()}`}
          value={draftRange}
          minDate={minDate}
          maxDate={maxDate}
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
