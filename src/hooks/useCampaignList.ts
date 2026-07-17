import { useMemo } from 'react'
import type { Campaign, CampaignStatus } from '@/lib/campaigns'

export type CampaignFilter = 'all' | CampaignStatus
export type CampaignSort = 'name' | 'latest' | 'oldest'

const STATUS_PRIORITY: Record<CampaignStatus, number> = {
  running: 0,
  before: 1,
  completed: 2,
}

const toTime = (date: string) => new Date(date.replaceAll('.', '-')).getTime()

/**
 * 캠페인 목록의 화면 전용 파생 상태입니다.
 * 피그마 가이드대로 상태(집행 중 → 집행 전 → 집행 완료)를 항상 첫 기준으로 둡니다.
 */
export function useCampaignList(
  campaigns: Campaign[],
  filter: CampaignFilter,
  keyword: string,
  sort: CampaignSort,
) {
  return useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('ko-KR')

    return campaigns
      .filter((campaign) => filter === 'all' || campaign.status === filter)
      .filter((campaign) =>
        campaign.name.toLocaleLowerCase('ko-KR').includes(normalizedKeyword),
      )
      .toSorted((left, right) => {
        const statusOrder = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status]
        if (statusOrder !== 0) return statusOrder

        if (sort === 'name') {
          return left.name.localeCompare(right.name, 'ko-KR')
        }
        // 목록 API에 등록일이 없어 집행 시작일 기준으로 최신/오래된순 정렬
        const dateOrder = toTime(left.startDate) - toTime(right.startDate)
        return sort === 'latest' ? -dateOrder : dateOrder
      })
  }, [campaigns, filter, keyword, sort])
}
