/**
 * 캠페인 관리(목록·상세·삭제) API. — DV-186
 * campaign.ts(등록)와 동일하게 ApiResponse 래퍼를 풀어 result를 resolve하고,
 * 실패는 CampaignApiError로 throw한다(호출부는 message만 표시).
 */
import { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './api'
import type { ApiResponse } from './api'
import { CampaignApiError } from './campaign'
import { API_ENDPOINTS } from './config'

// ── 공통: ApiResponse 언랩 ────────────────────────────────
function toCampaignApiError(err: unknown): CampaignApiError {
  if (isAxiosError(err) && err.response?.data) {
    const body = err.response.data as Partial<ApiResponse<unknown>>
    if (body.message) {
      return new CampaignApiError(body.code ?? 'UNKNOWN', body.message)
    }
  }
  return new CampaignApiError(
    'NETWORK_ERROR',
    '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  )
}

async function unwrap<T>(
  call: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  let data: ApiResponse<T>
  try {
    data = (await call).data
  } catch (err) {
    throw toCampaignApiError(err)
  }
  if (!data.isSuccess) {
    throw new CampaignApiError(data.code, data.message)
  }
  return data.result
}

// ── 상태 ─────────────────────────────────────────────────
/** 화면 전용 상태(태그·필터 3종). */
export const CAMPAIGN_STATUS = ['before', 'running', 'completed'] as const

export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number]

/** 백엔드 캠페인 상태(5종). REGISTERED/REGISTRATION_FAILED는 아직 집행 전으로 취급. */
type BackendCampaignStatus =
  | 'REGISTRATION_FAILED'
  | 'REGISTERED'
  | 'BEFORE_EXECUTION'
  | 'IN_EXECUTION'
  | 'AFTER_EXECUTION'

const STATUS_MAP: Record<BackendCampaignStatus, CampaignStatus> = {
  REGISTRATION_FAILED: 'before',
  REGISTERED: 'before',
  BEFORE_EXECUTION: 'before',
  IN_EXECUTION: 'running',
  AFTER_EXECUTION: 'completed',
}

/** 매체 형태 enum → 한글 태그 (campaign.ts와 동일 규칙). */
const SHAPE_TYPE_LABEL: Record<string, string> = {
  FLAT: '평면형',
  VERTICAL: '세로형',
  CORNER: '곡면형',
}

// ── 표기 헬퍼 ────────────────────────────────────────────
/** 'yyyy-MM-dd' → 'yyyy.MM.dd' (표·정렬 표기 통일). */
function toDotDate(isoDate: string): string {
  return isoDate.replaceAll('-', '.')
}

/** mm → m 표기 (정수면 소수점 제거: 12000 → '12'). */
function mmToMeter(mm: number): string {
  return Number((mm / 1000).toFixed(1)).toString()
}

// ── 목록 ─────────────────────────────────────────────────
/** GET /teams/{teamId}/campaigns 응답의 캠페인 한 건(백엔드 원형). */
interface CampaignListItemDto {
  campaignId: number
  campaignName: string
  status: BackendCampaignStatus
  executionStartDate: string // yyyy-MM-dd
  executionEndDate: string // yyyy-MM-dd
  mediaLocationAddress: string
  todayPlayCount: number
  dailyTargetPlayCount: number
}

interface CampaignsResult {
  teamName: string
  campaigns: CampaignListItemDto[]
}

/** 목록 화면(표)에서 소비하는 캠페인 모델. */
export interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  startDate: string // yyyy.MM.dd
  endDate: string // yyyy.MM.dd
  mediaAddress: string
  todayPlayCount: number
  totalPlayCount: number // 일 목표 송출 횟수(오늘/총 컬럼 분모)
}

function toCampaign(dto: CampaignListItemDto): Campaign {
  return {
    id: String(dto.campaignId),
    name: dto.campaignName,
    status: STATUS_MAP[dto.status] ?? 'before',
    startDate: toDotDate(dto.executionStartDate),
    endDate: toDotDate(dto.executionEndDate),
    mediaAddress: dto.mediaLocationAddress,
    todayPlayCount: dto.todayPlayCount,
    totalPlayCount: dto.dailyTargetPlayCount,
  }
}

export interface TeamCampaigns {
  teamName: string
  campaigns: Campaign[]
}

/** 팀 캠페인 목록 조회 — 필터/검색/정렬은 클라이언트에서(useCampaignList) 처리. */
export async function fetchTeamCampaigns(
  teamId: number,
): Promise<TeamCampaigns> {
  const result = await unwrap(
    api.get<ApiResponse<CampaignsResult>>(API_ENDPOINTS.teamCampaigns(teamId)),
  )
  return {
    teamName: result.teamName,
    campaigns: result.campaigns.map(toCampaign),
  }
}

// ── 상세 ─────────────────────────────────────────────────
/** GET /teams/{teamId}/campaigns/{campaignId} 응답(백엔드 원형). */
interface CampaignDetailDto {
  campaignId: number
  campaignName: string
  brandName: string
  executionStartDate: string
  executionEndDate: string
  dailyTargetPlayCount: number
  description: string
  creativeType: 'IMAGE' | 'VIDEO'
  creativeUrl: string
  mediaUnitId: number
  mediaName: string
  mediaLocationAddress: string
  mediaWidthMm: number
  mediaHeightMm: number
  mediaResolutionWidthPx: number
  mediaResolutionHeightPx: number
  mediaShapeTypes: string[]
}

/** 정보 모달에서 소비하는 상세 모델(표기 문자열까지 가공). */
export interface CampaignDetail {
  id: string
  name: string
  brandName: string
  startDate: string // yyyy.MM.dd
  endDate: string // yyyy.MM.dd
  dailyTargetPlayCount: number
  memo: string
  creativeType: 'IMAGE' | 'VIDEO'
  creativeUrl: string
  mediaName: string
  mediaAddress: string
  /** 실물 규격 표기 (예: '81 X 20m') */
  mediaSize: string
  /** 해상도 표기 (예: '1215 X 1792px') */
  mediaResolution: string
  /** 매체 형태 태그(평면형/세로형 등) */
  mediaTags: string[]
}

function toCampaignDetail(dto: CampaignDetailDto): CampaignDetail {
  return {
    id: String(dto.campaignId),
    name: dto.campaignName,
    brandName: dto.brandName,
    startDate: toDotDate(dto.executionStartDate),
    endDate: toDotDate(dto.executionEndDate),
    dailyTargetPlayCount: dto.dailyTargetPlayCount,
    memo: dto.description,
    creativeType: dto.creativeType,
    creativeUrl: dto.creativeUrl,
    mediaName: dto.mediaName,
    mediaAddress: dto.mediaLocationAddress,
    mediaSize: `${mmToMeter(dto.mediaWidthMm)} X ${mmToMeter(dto.mediaHeightMm)}m`,
    mediaResolution: `${dto.mediaResolutionWidthPx} X ${dto.mediaResolutionHeightPx}px`,
    mediaTags: dto.mediaShapeTypes.map((type) => SHAPE_TYPE_LABEL[type] ?? type),
  }
}

/** 캠페인 상세 조회 — 정보 모달 진입 시. */
export async function fetchCampaignDetail(
  teamId: number,
  campaignId: number,
): Promise<CampaignDetail> {
  const result = await unwrap(
    api.get<ApiResponse<CampaignDetailDto>>(
      API_ENDPOINTS.teamCampaignDetail(teamId, campaignId),
    ),
  )
  return toCampaignDetail(result)
}

// ── 삭제 ─────────────────────────────────────────────────
/** 캠페인 삭제(hard delete). */
export async function deleteCampaign(
  teamId: number,
  campaignId: number,
): Promise<void> {
  await unwrap(
    api.delete<ApiResponse<unknown>>(
      API_ENDPOINTS.teamCampaignDetail(teamId, campaignId),
    ),
  )
}

// ── react-query ──────────────────────────────────────────
export const campaignKeys = {
  all: ['team-campaigns'] as const,
  list: (teamId: number) => ['team-campaigns', 'list', teamId] as const,
  detail: (teamId: number, campaignId: number) =>
    ['team-campaigns', 'detail', teamId, campaignId] as const,
}

/** 팀 캠페인 목록 훅. teamId가 없으면(팀 미소속) 조회를 미룬다. */
export function useTeamCampaigns(teamId: number | undefined) {
  return useQuery({
    queryKey: campaignKeys.list(teamId ?? 0),
    queryFn: () => fetchTeamCampaigns(teamId as number),
    enabled: teamId != null,
  })
}

/** 캠페인 상세 훅 — campaignId가 있을 때만(모달 오픈 시) 조회. */
export function useCampaignDetail(
  teamId: number | undefined,
  campaignId: number | null,
) {
  return useQuery({
    queryKey: campaignKeys.detail(teamId ?? 0, campaignId ?? 0),
    queryFn: () => fetchCampaignDetail(teamId as number, campaignId as number),
    enabled: teamId != null && campaignId != null,
  })
}

/** 캠페인 삭제 mutation — 성공 시 목록 무효화. */
export function useDeleteCampaign(teamId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (campaignId: number) =>
      deleteCampaign(teamId as number, campaignId),
    onSuccess: () => {
      if (teamId != null) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.list(teamId) })
      }
    },
  })
}
