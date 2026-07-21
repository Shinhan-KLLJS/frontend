/**
 * 캠페인 등록 API.
 * 함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 CampaignApiError로 throw한다(호출부는 message만 표시).
 */
import axios, { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { DateRange } from '@/components/ui'
import { api } from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'

/** 기본 정보 폼 스키마 — Step1 '다음' 활성 조건이자 등록 요청 값의 원천 */
export const campaignInfoSchema = z.object({
  name: z.string().trim().min(1, '캠페인명을 입력해 주세요.'),
  brand: z.string().trim().min(1, '브랜드명을 입력해 주세요.'),
  period: z
    .custom<DateRange>()
    .refine((range) => Boolean(range?.start && range?.end), {
      message: '송출기간을 선택해 주세요.',
    }),
  dailyPlayCount: z
    .string()
    .regex(/^\d+$/, '하루 송출 횟수를 숫자로 입력해 주세요.')
    .refine(
      (value) => {
        const count = Number(value)
        // 매우 긴 숫자열은 Number가 Infinity/불안전 정수가 되어 요청 JSON이 null로 나가므로 차단
        return Number.isSafeInteger(count) && count > 0
      },
      { message: '1 이상의 올바른 숫자를 입력해 주세요.' },
    ),
  memo: z.string().max(500, '메모는 최대 500자까지 입력할 수 있습니다.'),
})

export type CampaignInfoValues = z.infer<typeof campaignInfoSchema>

/** 백엔드 ApiResponse의 code/message를 보존하는 에러 — 호출부는 message만 표시 */
export class CampaignApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'CampaignApiError'
    this.code = code
  }
}

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

/** ApiResponse 래퍼를 풀어 result를 반환하고, 실패(HTTP 오류/isSuccess=false)는 CampaignApiError로 변환 */
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

// ── 매체 목록 ──────────────────────────────────────────────

/** 매체 형태 — 백엔드 enum */
type MediaShapeType = 'FLAT' | 'VERTICAL' | 'CORNER'

const SHAPE_TYPE_LABEL: Record<MediaShapeType, string> = {
  FLAT: '평면형',
  VERTICAL: '세로형',
  CORNER: '곡면형',
}

/** GET /media-units 응답의 매체 한 건 (백엔드 원형) */
interface MediaUnitDto {
  mediaUnitId: number
  mediaName: string
  photoUrl: string
  locationAddress: string
  sido: string
  sigungu: string
  latitude: number
  longitude: number
  widthMm: number
  heightMm: number
  resolutionWidthPx: number
  resolutionHeightPx: number
  shapeTypes: MediaShapeType[]
  available: boolean
  unavailableReason: string | null
}

interface MediaUnitsResult {
  mediaUnits: MediaUnitDto[]
  /** 다음 페이지(더 받을 매체)가 남았는지 */
  hasMore: boolean
}

/** 화면에서 소비하는 매체 모델 (카드·지도·최종 확인 공용) */
export interface CampaignMedia {
  id: string
  name: string
  address: string
  // 지도 지역 이동(시/도·시/군/구 드롭다운) 필터 기준
  sido: string
  sigungu: string
  /** 송출면 해상도 표기 (예: '1312 x 1664px') */
  resolution: string
  /** 실물 규격 표기 (예: '81 X 20m') */
  size: string
  /** 매체 형태 태그 (평면형/세로형 등) */
  types: string[]
  lat: number
  lng: number
  thumbnail: string
  /** 선택 가능 여부 — false면 이미 다른 캠페인이 점유 중 */
  available: boolean
  unavailableReason: string | null
}

/** mm → m 표기 (정수면 소수점 제거: 12000 → '12') */
function mmToMeter(mm: number): string {
  return Number((mm / 1000).toFixed(1)).toString()
}

/** 백엔드 매체 → 화면 모델 매핑 (표기 문자열·한글 형태 라벨 생성) */
function toCampaignMedia(dto: MediaUnitDto): CampaignMedia {
  return {
    id: String(dto.mediaUnitId),
    name: dto.mediaName,
    address: dto.locationAddress,
    sido: dto.sido,
    sigungu: dto.sigungu,
    resolution: `${dto.resolutionWidthPx} x ${dto.resolutionHeightPx}px`,
    size: `${mmToMeter(dto.widthMm)} X ${mmToMeter(dto.heightMm)}m`,
    types: dto.shapeTypes.map((type) => SHAPE_TYPE_LABEL[type] ?? type),
    lat: dto.latitude,
    lng: dto.longitude,
    thumbnail: dto.photoUrl,
    available: dto.available,
    unavailableReason: dto.unavailableReason,
  }
}

/** 매체 목록 조회 필터 — 서버사이드(GET /media-units 쿼리 파라미터) */
export interface MediaUnitsQuery {
  /** 지역 검색어 (매체명·주소 등) — 있으면 지역 필터보다 우선 */
  keyword?: string
  sido?: string
  sigungu?: string
  /** 캠페인 송출기간 (yyyy-MM-dd) — 이 기간 기준으로 available(등록 가능 여부) 계산 */
  executionStartDate?: string
  executionEndDate?: string
}

/** 매체 목록 한 페이지 — 화면 모델 + 다음 페이지 존재 여부 */
export interface MediaPage {
  items: CampaignMedia[]
  hasMore: boolean
}

// 지도·리스트를 한 번에 다 받지 않고 점진 로드: 첫 페이지 10개, 이후 6개씩.
const FIRST_PAGE_SIZE = 10
const NEXT_PAGE_SIZE = 6

/**
 * 송출 매체 한 페이지 조회 — keyword/sido/sigungu 필터 + 송출기간별 available 계산.
 * offset/limit 오프셋 페이지네이션(백엔드 getMediaUnits).
 */
export async function fetchCampaignMedia(
  query: MediaUnitsQuery,
  offset: number,
  limit: number,
): Promise<MediaPage> {
  const result = await unwrap(
    api.get<ApiResponse<MediaUnitsResult>>(API_ENDPOINTS.mediaUnits, {
      params: {
        keyword: query.keyword || undefined,
        sido: query.sido || undefined,
        sigungu: query.sigungu || undefined,
        executionStartDate: query.executionStartDate || undefined,
        executionEndDate: query.executionEndDate || undefined,
        offset,
        limit,
      },
    }),
  )
  return { items: result.mediaUnits.map(toCampaignMedia), hasMore: result.hasMore }
}

export const mediaUnitKeys = {
  all: ['media-units'] as const,
  list: (query: MediaUnitsQuery) => ['media-units', 'list', query] as const,
}

/**
 * 매체 목록 무한 스크롤 훅 — 첫 페이지 10개, 이후 6개씩 서버에서 이어 받는다.
 * enabled=false면 조회를 미룬다(매체 선택 단계 진입 전). 필터(query)가 바뀌면 처음부터 다시 받는다.
 */
export function useMediaUnits(enabled = true, query: MediaUnitsQuery = {}) {
  return useInfiniteQuery({
    queryKey: mediaUnitKeys.list(query),
    queryFn: ({ pageParam }) =>
      fetchCampaignMedia(
        query,
        pageParam,
        pageParam === 0 ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE,
      ),
    initialPageParam: 0,
    // 다음 offset = 지금까지 받은 개수(실제 수신량 기준). hasMore=false거나 빈 페이지면 종료.
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore || lastPage.items.length === 0) return undefined
      return allPages.reduce((total, page) => total + page.items.length, 0)
    },
    enabled,
  })
}

// ── 매체 지역 목록 ─────────────────────────────────────────

/** 시/군/구 드롭다운의 '전체'(시/도 전체) 옵션 값 — 선택 시 sigungu 필터를 생략한다 */
export const ALL_SIGUNGU = '전체'

/** 시/도 + 하위 시/군/구 목록 (지역 드롭다운 옵션 소스) */
export interface MediaRegion {
  sido: string
  sigungu: string[]
}

interface MediaRegionsResult {
  regions: MediaRegion[]
}

/** 매체가 존재하는 지역 목록 조회 — 드롭다운 옵션 채움. 지도 이동 좌표는 별도(정적) */
export async function fetchMediaRegions(): Promise<MediaRegion[]> {
  const result = await unwrap(
    api.get<ApiResponse<MediaRegionsResult>>(API_ENDPOINTS.mediaUnitRegions),
  )
  return result.regions
}

export const mediaRegionKeys = {
  all: ['media-unit-regions'] as const,
}

/** 매체 지역 목록 react-query 훅 */
export function useMediaRegions(enabled = true) {
  return useQuery({
    queryKey: mediaRegionKeys.all,
    queryFn: fetchMediaRegions,
    enabled,
  })
}

// ── 영상 업로드 ────────────────────────────────────────────

/** POST /campaign-creatives/upload-url 응답 — presigned 업로드 계약 */
interface UploadUrlResult {
  uploadUrl: string
  creativeUrl: string
  method: string
  requiredHeaders: Record<string, string>
  creativeToken: string
  expiresAt: string
}

/** 업로드 결과 — creativeToken은 캠페인 등록 요청에 사용 */
export interface CreativeUpload {
  creativeToken: string
  creativeUrl: string
}

/**
 * 광고 영상 업로드 — presigned 2단계.
 * 1) 백엔드에서 업로드 URL·토큰 발급 → 2) 발급받은 URL로 스토리지에 파일 직접 업로드.
 * 2단계는 인증 헤더/쿠키가 붙지 않도록 api 인스턴스가 아닌 순수 axios로 호출한다.
 */
export async function uploadCampaignVideo(file: File): Promise<CreativeUpload> {
  const issued = await unwrap(
    api.post<ApiResponse<UploadUrlResult>>(
      API_ENDPOINTS.campaignCreativeUploadUrl,
      {
        creativeType: 'VIDEO',
        originalFilename: file.name,
        contentType: file.type,
      },
    ),
  )

  try {
    await axios.request({
      url: issued.uploadUrl,
      method: issued.method,
      headers: issued.requiredHeaders,
      data: file,
    })
  } catch (err) {
    throw toCampaignApiError(err)
  }

  return { creativeToken: issued.creativeToken, creativeUrl: issued.creativeUrl }
}

// ── 캠페인 등록 ────────────────────────────────────────────

export interface CreateCampaignInput {
  info: CampaignInfoValues
  mediaUnitId: number
  creativeToken: string
}

interface CreateCampaignResult {
  campaignId: number
  teamId: number
  campaignName: string
  status: string
  creativeType: 'IMAGE' | 'VIDEO'
  creativeUrl: string
  mediaUnitId: number
}

/** Date → 'YYYY-MM-DD' (로컬 기준 — toISOString의 UTC 변환으로 날짜가 하루 밀리는 것 방지) */
export function toApiDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 캠페인 등록 — 최종 제출. 기본 정보 폼 값을 백엔드 필드로 매핑해 전송 */
export async function createCampaign(
  teamId: number,
  input: CreateCampaignInput,
): Promise<{ campaignId: number }> {
  const { info } = input
  if (!info.period.start || !info.period.end) {
    throw new CampaignApiError('INVALID_PERIOD', '송출기간을 선택해 주세요.')
  }

  const result = await unwrap(
    api.post<ApiResponse<CreateCampaignResult>>(
      API_ENDPOINTS.teamCampaigns(teamId),
      {
        creativeToken: input.creativeToken,
        campaignName: info.name,
        brandName: info.brand,
        executionStartDate: toApiDate(info.period.start),
        executionEndDate: toApiDate(info.period.end),
        dailyTargetPlayCount: Number(info.dailyPlayCount),
        description: info.memo,
        mediaUnitId: input.mediaUnitId,
      },
    ),
  )
  return { campaignId: result.campaignId }
}
