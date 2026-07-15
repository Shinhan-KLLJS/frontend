import { useQuery } from '@tanstack/react-query'
import { api } from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'

/**
 * 캠페인 상태값. DRAFT(임시저장)는 존재하지 않는다.
 * REGISTRATION_FAILED(등록 실패) / REGISTERED(등록 완료) /
 * BEFORE_EXECUTION(집행 전) / IN_EXECUTION(집행 중) / AFTER_EXECUTION(집행 후)
 */
export type CampaignStatus =
  | 'REGISTRATION_FAILED'
  | 'REGISTERED'
  | 'BEFORE_EXECUTION'
  | 'IN_EXECUTION'
  | 'AFTER_EXECUTION'

export type PeriodStatus =
  | 'BEFORE_EXECUTION'
  | 'IN_EXECUTION'
  | 'AFTER_EXECUTION'

export interface Period {
  startDate: string // yyyy-MM-dd
  endDate: string // yyyy-MM-dd
}

/** 목록 항목 — GET /dashboard/campaigns */
export interface CampaignSummary {
  campaignId: number
  campaignName: string
  brandName: string
  executionStartDate: string // yyyy-MM-dd
  executionEndDate: string // yyyy-MM-dd
  status: CampaignStatus
  /**
   * 기본 선택 캠페인 여부. 필터 적용 전 전체 목록 기준으로 백엔드가 하나만 지정한다.
   * keyword/status 필터로 해당 캠페인이 빠지면 목록에 true가 아예 없을 수 있다.
   */
  isDefaultSelected: boolean
}

/** 상세 — GET /dashboard/campaigns/{campaignId} */
export interface CampaignDetail {
  campaignId: number
  campaignName: string
  brandName: string
  description: string
  imageUrl: string
  status: CampaignStatus
  mediaUnitId: number
  dailyTargetPlayCount: number
  executionPeriod: Period // 캠페인 집행 전체 기간
  selectedPeriod: Period // 요청한 조회 기간(에코)
  effectivePeriod: Period | null // 실제 데이터가 존재하는 유효 기간
  periodStatus: PeriodStatus
}

/** 송출정보 — GET /dashboard/campaigns/{campaignId}/delivery (KPI 섹션 소스) */
export interface CampaignDelivery {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  today: string // yyyy-MM-dd
  serverTime: string // ISO date-time
  playStartTime: string
  playIntervalSec: number
  refreshIntervalSec: number // 프론트 재조회 권장 주기(초)
  currentPlayCount: number // 현재 송출 회수
  dailyTargetPlayCount: number // 일 목표 송출 회수(현재 송출 회수 분모)
  periodTargetPlayCount: number
  progressRate: number // 오늘 진행률(%)
  totalPlayTimeMin: number // 총 플레이 타임(분)
  nextIncrementAt: string // ISO date-time
  isEstimated: boolean // 무중단 송출 추정 여부(다운타임 실측 아님)
}

/** 어제 대비 비교치 */
export interface YesterdayComparison {
  baseDate: string // yyyy-MM-dd
  baseValue: number
  increaseRate: number // % (양수=증가, 음수=감소)
}

export interface PopulationMetric {
  value: number
  unit: string
  yesterdayComparison: YesterdayComparison
}

export interface RateMetric {
  value: number
  unit: string
  yesterdayComparison: YesterdayComparison
}

/** 깔때기(TOLA) — GET /dashboard/campaigns/{campaignId}/funnel */
export interface CampaignFunnel {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  serverTime: string
  aggregationUnit: string
  aggregationCutoffTime: string // ISO date-time — 툴팁 "HH:mm 기준" 표기 소스
  refreshIntervalSec: number
  metrics: {
    totalTrafficCount: PopulationMetric // 전체 유동인구
    exposedPopulationCount: PopulationMetric // 노출인구
    attentionPopulationCount: PopulationMetric // 주목인구
    attentionConversionRate: RateMetric // 주목 전환률
  }
}

export interface CampaignQuery {
  keyword?: string
  status?: CampaignStatus
}

/** Date → 'yyyy-MM-dd' (API 쿼리 포맷). date.ts의 formatDate는 점 포맷이라 별도. */
export function toApiDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 'yyyy-MM-dd' → Date (로컬 자정) */
export function fromApiDate(text: string): Date {
  const [y, m, d] = text.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * 캠페인 목록 조회 — 사용자가 ACTIVE로 속한 모든 팀의 캠페인 합집합.
 * 소속 팀이 없거나 필터에 맞는 캠페인이 없으면 빈 배열. 항상 생성일 최신순.
 */
export async function fetchCampaigns(
  query: CampaignQuery = {},
): Promise<CampaignSummary[]> {
  const { data } = await api.get<ApiResponse<{ campaigns: CampaignSummary[] }>>(
    API_ENDPOINTS.dashboardCampaigns,
    { params: { keyword: query.keyword || undefined, status: query.status } },
  )
  return data.result.campaigns
}

/** 캠페인 상세 조회 — 조회 기간(selected_start_date·selected_end_date)은 필수. */
export async function fetchCampaignDetail(
  campaignId: number,
  period: { start: Date; end: Date },
): Promise<CampaignDetail> {
  const { data } = await api.get<ApiResponse<CampaignDetail>>(
    API_ENDPOINTS.dashboardCampaignDetail(campaignId),
    {
      params: {
        selected_start_date: toApiDate(period.start),
        selected_end_date: toApiDate(period.end),
      },
    },
  )
  return data.result
}

/** 송출정보 조회 — KPI 섹션 소스. 조회 기간(selected_start_date·selected_end_date) 필수. */
export async function fetchCampaignDelivery(
  campaignId: number,
  period: { start: Date; end: Date },
): Promise<CampaignDelivery> {
  const { data } = await api.get<ApiResponse<CampaignDelivery>>(
    API_ENDPOINTS.dashboardCampaignDelivery(campaignId),
    {
      params: {
        selected_start_date: toApiDate(period.start),
        selected_end_date: toApiDate(period.end),
      },
    },
  )
  return data.result
}

/** 깔때기(TOLA) 지표 조회 — 조회 기간 필수. */
export async function fetchCampaignFunnel(
  campaignId: number,
  period: { start: Date; end: Date },
): Promise<CampaignFunnel> {
  const { data } = await api.get<ApiResponse<CampaignFunnel>>(
    API_ENDPOINTS.dashboardCampaignFunnel(campaignId),
    {
      params: {
        selected_start_date: toApiDate(period.start),
        selected_end_date: toApiDate(period.end),
      },
    },
  )
  return data.result
}

/** 필터 적용 전 전체 목록 기준 기본 선택 캠페인. 없으면 최신순 첫 항목. */
export function pickDefaultCampaign(
  campaigns: CampaignSummary[],
): CampaignSummary | undefined {
  return campaigns.find((c) => c.isDefaultSelected) ?? campaigns[0]
}

export const campaignKeys = {
  all: ['campaigns'] as const,
  list: (query: CampaignQuery) => ['campaigns', 'list', query] as const,
  detail: (campaignId: number, start: string, end: string) =>
    ['campaigns', 'detail', campaignId, start, end] as const,
  delivery: (campaignId: number, start: string, end: string) =>
    ['campaigns', 'delivery', campaignId, start, end] as const,
  funnel: (campaignId: number, start: string, end: string) =>
    ['campaigns', 'funnel', campaignId, start, end] as const,
}

/** 캠페인 목록 react-query 훅 */
export function useCampaigns(query: CampaignQuery = {}) {
  return useQuery({
    queryKey: campaignKeys.list(query),
    queryFn: () => fetchCampaigns(query),
  })
}

/**
 * 캠페인 상세 react-query 훅.
 * campaignId·시작·종료가 모두 있을 때만 조회(enabled). 날짜가 바뀌면 자동 재조회.
 */
export function useCampaignDetail(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  const enabled = Boolean(campaignId && period.start && period.end)
  return useQuery({
    queryKey:
      enabled && campaignId && period.start && period.end
        ? campaignKeys.detail(
            campaignId,
            toApiDate(period.start),
            toApiDate(period.end),
          )
        : ['campaigns', 'detail', 'disabled'],
    queryFn: () =>
      fetchCampaignDetail(campaignId as number, {
        start: period.start as Date,
        end: period.end as Date,
      }),
    enabled,
  })
}

/**
 * 송출정보(KPI) react-query 훅.
 * 응답의 refreshIntervalSec 주기로 자동 재조회해 현재 송출 회수를 실시간 갱신한다.
 */
export function useCampaignDelivery(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  const enabled = Boolean(campaignId && period.start && period.end)
  return useQuery({
    queryKey:
      enabled && campaignId && period.start && period.end
        ? campaignKeys.delivery(
            campaignId,
            toApiDate(period.start),
            toApiDate(period.end),
          )
        : ['campaigns', 'delivery', 'disabled'],
    queryFn: () =>
      fetchCampaignDelivery(campaignId as number, {
        start: period.start as Date,
        end: period.end as Date,
      }),
    enabled,
    refetchInterval: (query) => {
      const sec = query.state.data?.refreshIntervalSec
      return sec && sec > 0 ? sec * 1000 : false
    },
  })
}

/** 깔때기(TOLA) 지표 react-query 훅. refreshIntervalSec 주기로 자동 재조회. */
export function useCampaignFunnel(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  const enabled = Boolean(campaignId && period.start && period.end)
  return useQuery({
    queryKey:
      enabled && campaignId && period.start && period.end
        ? campaignKeys.funnel(
            campaignId,
            toApiDate(period.start),
            toApiDate(period.end),
          )
        : ['campaigns', 'funnel', 'disabled'],
    queryFn: () =>
      fetchCampaignFunnel(campaignId as number, {
        start: period.start as Date,
        end: period.end as Date,
      }),
    enabled,
    refetchInterval: (query) => {
      const sec = query.state.data?.refreshIntervalSec
      return sec && sec > 0 ? sec * 1000 : false
    },
  })
}
