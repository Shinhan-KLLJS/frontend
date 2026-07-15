import { useEffect, useRef, useState } from 'react'
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
  /** 기본 선택 캠페인 여부(백엔드가 하나 지정). 필터로 빠지면 목록에 true가 없을 수도 있다. */
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

/** 기간형 대시보드 리소스 공통 필드 */
interface PeriodResource {
  refreshIntervalSec: number
}

/** 실시간 시청수(시간별 집계) — GET .../realtime-graph/hourly */
export interface RealtimeHourlyPoint {
  eventTime: string // ISO date-time
  exposedPopulationCount: number
  attentionPopulationCount: number
}
export interface CampaignRealtimeHourly extends PeriodResource {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  serverTime: string
  aggregationUnit: string
  aggregationCutoffTime: string
  points: RealtimeHourlyPoint[]
}

/** 실시간 시청수(오늘·5초·커서 폴링) — GET .../realtime-graph */
export interface RealtimeGraphPoint {
  eventTime: string // ISO date-time
  intervalSec: number
  exposedPopulationCount: number
  attentionPopulationCount: number
  source: string
}
export interface CampaignRealtimeGraph {
  campaignId: number
  selectedDate: string
  effectivePeriod: { startDate: string; endDate: string }
  periodStatus: PeriodStatus
  serverTime: string
  pollIntervalSec: number
  overlapSec: number
  lastEventTime: string // 다음 폴링 커서(after_event_time)
  nextPollAfter: string
  dataDelaySec: number
  hasMore: boolean
  points: RealtimeGraphPoint[]
}

/** 평균 시청시간 — GET .../average-watch-time */
export interface WatchTimeBucketData {
  bucket: string
  label: string
  count: number
  ratio: number // 0~1 비율
}
export interface CampaignAverageWatchTime extends PeriodResource {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  serverTime: string
  aggregationUnit: string
  aggregationCutoffTime: string
  averageWatchTimeSec: number | null
  watchTimeBuckets: WatchTimeBucketData[]
}

/** 성별·연령 시청 비율 — GET .../demographic-view-ratio */
export type AgeGroupCode =
  | 'UNDER_10'
  | '10S'
  | '20S'
  | '30S'
  | '40S'
  | '50S'
  | '60_PLUS'
export interface DemographicAgeGroup {
  ageGroup: AgeGroupCode
  label: string
  maleRatio: number
  femaleRatio: number
  totalRatio: number
  maleShareRatio: number
  femaleShareRatio: number
}
export interface CampaignDemographic extends PeriodResource {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  serverTime: string
  aggregationUnit: string
  aggregationCutoffTime: string
  genderSummary: { maleRatio: number | null; femaleRatio: number | null }
  ageGroups: DemographicAgeGroup[]
}

/** 시간·연령별 노출도 — GET .../hourly-age-exposure */
export interface ExposureAgeGroup {
  ageGroup: AgeGroupCode
  label: string
}
export interface ExposureCellData {
  hour: string
  ageGroup: AgeGroupCode
  exposureCount: number
  intensityLevel: number // 0~4
  maleExposureCount: number
  maleIntensityLevel: number
  femaleExposureCount: number
  femaleIntensityLevel: number
}
export interface CampaignExposure extends PeriodResource {
  campaignId: number
  selectedPeriod: Period
  effectivePeriod: Period
  periodStatus: PeriodStatus
  serverTime: string
  aggregationUnit: string
  aggregationCutoffTime: string
  hours: string[]
  ageGroups: ExposureAgeGroup[]
  cells: ExposureCellData[]
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

/** 캠페인 목록 조회. 소속 팀/필터 결과가 없으면 빈 배열, 항상 생성일 최신순. */
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

/** 캠페인 상세 훅. campaignId·기간이 모두 있을 때만 조회(enabled). */
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

/** 송출정보(KPI) 훅. refreshIntervalSec 주기로 자동 재조회. */
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

// ── 기간형 리소스 공통 (선택 기간 쿼리 + refreshIntervalSec 폴링) ─────────────

async function fetchPeriodResource<T>(
  endpoint: string,
  period: { start: Date; end: Date },
): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(endpoint, {
    params: {
      selected_start_date: toApiDate(period.start),
      selected_end_date: toApiDate(period.end),
    },
  })
  return data.result
}

/** campaignId + 조회 기간으로 기간형 리소스를 조회하는 공통 훅. */
function usePeriodResource<T extends PeriodResource>(
  keyBase: string,
  endpoint: (campaignId: number) => string,
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  const enabled = Boolean(campaignId && period.start && period.end)
  return useQuery({
    queryKey:
      enabled && campaignId && period.start && period.end
        ? [keyBase, campaignId, toApiDate(period.start), toApiDate(period.end)]
        : [keyBase, 'disabled'],
    queryFn: () =>
      fetchPeriodResource<T>(endpoint(campaignId as number), {
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

/** 실시간 시청수(시간별) 훅 */
export function useRealtimeHourly(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  return usePeriodResource<CampaignRealtimeHourly>(
    'realtime-hourly',
    API_ENDPOINTS.dashboardCampaignRealtimeHourly,
    campaignId,
    period,
  )
}

/** 평균 시청시간 훅 */
export function useAverageWatchTime(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  return usePeriodResource<CampaignAverageWatchTime>(
    'average-watch-time',
    API_ENDPOINTS.dashboardCampaignAverageWatchTime,
    campaignId,
    period,
  )
}

/** 성별·연령 시청 비율 훅 */
export function useDemographic(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  return usePeriodResource<CampaignDemographic>(
    'demographic',
    API_ENDPOINTS.dashboardCampaignDemographic,
    campaignId,
    period,
  )
}

/** 시간·연령별 노출도 훅 */
export function useExposure(
  campaignId: number | undefined,
  period: { start?: Date; end?: Date },
) {
  return usePeriodResource<CampaignExposure>(
    'exposure',
    API_ENDPOINTS.dashboardCampaignExposure,
    campaignId,
    period,
  )
}

// ── 실시간 그래프(5초·커서 폴링) ─────────────────────────────────────────────

/** 실시간 그래프 1회 조회. afterEventTime 커서 이후의 신규 포인트만 반환. */
async function fetchRealtimeGraph(
  campaignId: number,
  afterEventTime?: string,
): Promise<CampaignRealtimeGraph> {
  const { data } = await api.get<ApiResponse<CampaignRealtimeGraph>>(
    API_ENDPOINTS.dashboardCampaignRealtime(campaignId),
    { params: afterEventTime ? { after_event_time: afterEventTime } : {} },
  )
  return data.result
}

/** 폴링 누적 보관 창(분). 이보다 오래된 포인트는 버린다. */
const REALTIME_WINDOW_MS = 60 * 60 * 1000

/** 기존 + 신규 포인트를 eventTime 기준 중복 제거·정렬하고 보관 창으로 제한. */
function mergeRealtimePoints(
  prev: RealtimeGraphPoint[],
  incoming: RealtimeGraphPoint[],
): RealtimeGraphPoint[] {
  if (!incoming.length) return prev
  const byTime = new Map<string, RealtimeGraphPoint>()
  for (const p of prev) byTime.set(p.eventTime, p)
  for (const p of incoming) byTime.set(p.eventTime, p) // overlapSec 겹침은 최신으로 덮음
  const merged = [...byTime.values()].sort((a, b) =>
    a.eventTime.localeCompare(b.eventTime),
  )
  const latestMs = new Date(merged[merged.length - 1].eventTime).getTime()
  return merged.filter(
    (p) => latestMs - new Date(p.eventTime).getTime() <= REALTIME_WINDOW_MS,
  )
}

/** 다음 폴링까지 지연(ms). nextPollAfter 우선, 없으면 pollIntervalSec, 최소 1초. */
function realtimePollDelay(result: CampaignRealtimeGraph): number {
  if (result.nextPollAfter) {
    const ms = new Date(result.nextPollAfter).getTime() - Date.now()
    if (ms > 0) return Math.min(ms, 30000)
  }
  const sec = result.pollIntervalSec > 0 ? result.pollIntervalSec : 5
  return Math.max(1000, sec * 1000)
}

/** 실시간 그래프(오늘) 폴링 훅. enabled 동안 커서 폴링·누적(오름차순·중복제거·최근 1시간). */
export function useRealtimeGraph(
  campaignId: number | undefined,
  enabled: boolean,
): { points: RealtimeGraphPoint[] } {
  const [points, setPoints] = useState<RealtimeGraphPoint[]>([])
  const cursorRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !campaignId) {
      setPoints([])
      cursorRef.current = undefined
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      try {
        const result = await fetchRealtimeGraph(campaignId, cursorRef.current)
        if (cancelled) return
        if (result.points.length) {
          cursorRef.current =
            result.lastEventTime ?? result.points[result.points.length - 1].eventTime
          setPoints((prev) => mergeRealtimePoints(prev, result.points))
        }
        timer = setTimeout(poll, realtimePollDelay(result))
      } catch {
        if (cancelled) return
        timer = setTimeout(poll, 5000) // 실패 시 5초 후 재시도
      }
    }
    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [campaignId, enabled])

  return { points }
}
