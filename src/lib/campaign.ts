/**
 * 캠페인 등록 API.
 * 함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 CampaignApiError로 throw한다(호출부는 message만 표시).
 */
import axios, { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { useQuery } from '@tanstack/react-query'
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
    .refine((value) => Number(value) > 0, {
      message: '1 이상의 숫자를 입력해 주세요.',
    }),
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

/** 송출 매체 리스트 조회 — 검색·지역 필터는 현재 클라이언트에서 처리하므로 전체 목록을 받는다 */
export async function fetchCampaignMedia(): Promise<CampaignMedia[]> {
  const result = await unwrap(
    api.get<ApiResponse<MediaUnitsResult>>(API_ENDPOINTS.mediaUnits),
  )
  return result.mediaUnits.map(toCampaignMedia)
}

export const mediaUnitKeys = {
  all: ['media-units'] as const,
}

/**
 * 매체 목록 react-query 훅 — 대시보드(useCampaigns)와 동일 패턴 (캐싱·loading/error).
 * enabled=false면 조회를 미룬다 (매체 선택 단계 진입 전 불필요한 호출 방지).
 */
export function useMediaUnits(enabled = true) {
  return useQuery({
    queryKey: mediaUnitKeys.all,
    queryFn: fetchCampaignMedia,
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
function toApiDate(date: Date): string {
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
