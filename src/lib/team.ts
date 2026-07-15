/**
 * 팀 온보딩 API.
 * 함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 TeamApiError로 throw한다(호출부는 message만 표시).
 */
import { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { maskDateInput } from '@/components/ui/date'
import { api } from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'
import { maskRegistrationNumber } from './team-format'

export interface CreateTeamInput {
  teamName: string
  businessName: string
  ceoName: string
  openedAt: string // 'YYYY.MM.DD'
  registrationNumber: string // '000-00-00000'
}

/** 사업자등록증 업로드 결과 — 폼 자동 채움용 OCR 값 + 팀 생성에 넘길 저장 키 */
export interface BusinessLicenseResult {
  documentStorageKey: string
  ocr: {
    businessName: string
    ceoName: string
    openedAt: string
    registrationNumber: string
  }
}

export interface CreatedTeam {
  id: number
  name: string
}

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface JoinedTeam {
  id: number
  name: string
  role: TeamRole
}

export interface TeamInviteCode {
  code: string
  expiresAt: string
}

/** 백엔드 ApiResponse의 code/message를 보존하는 에러 — 호출부는 message만 표시 */
export class TeamApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'TeamApiError'
    this.code = code
  }
}

function toTeamApiError(err: unknown): TeamApiError {
  if (isAxiosError(err) && err.response?.data) {
    const body = err.response.data as Partial<ApiResponse<unknown>>
    if (body.message) {
      return new TeamApiError(body.code ?? 'UNKNOWN', body.message)
    }
  }
  return new TeamApiError(
    'NETWORK_ERROR',
    '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  )
}

/** ApiResponse 래퍼를 풀어 result를 반환하고, 실패(HTTP 오류/isSuccess=false)는 TeamApiError로 변환 */
async function unwrap<T>(
  call: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<T> {
  let data: ApiResponse<T>
  try {
    data = (await call).data
  } catch (err) {
    throw toTeamApiError(err)
  }
  if (!data.isSuccess) {
    throw new TeamApiError(data.code, data.message)
  }
  return data.result
}

interface OcrResult {
  companyName: string | null
  representativeName: string | null
  businessNumber: string | null
  businessOpeningDate: string | null
  businessType: string | null
  businessItem: string | null
}

interface BusinessRegistrationUploadResponse {
  documentStorageKey: string
  ocrResult: OcrResult
}

/** 사업자등록증 업로드 + OCR — multipart. documentStorageKey는 1시간 유효, 팀 생성 시 함께 보낸다 */
export async function uploadBusinessLicense(
  file: File,
): Promise<BusinessLicenseResult> {
  const formData = new FormData()
  formData.append('file', file)

  const result = await unwrap<BusinessRegistrationUploadResponse>(
    api.post(API_ENDPOINTS.businessRegistration, formData),
  )
  const ocr = result.ocrResult
  return {
    documentStorageKey: result.documentStorageKey,
    // OCR 결과에 팀명은 없다 — 사업자명/대표자명/개업일/등록번호만 채운다 (null은 빈 값).
    // 개업일('2024-06-24')·사업자번호('4959240582')는 폼 형식(YYYY.MM.DD / 000-00-00000)과 달라 마스크로 정규화한다.
    ocr: {
      businessName: ocr.companyName ?? '',
      ceoName: ocr.representativeName ?? '',
      openedAt: ocr.businessOpeningDate
        ? maskDateInput(ocr.businessOpeningDate)
        : '',
      registrationNumber: ocr.businessNumber
        ? maskRegistrationNumber(ocr.businessNumber)
        : '',
    },
  }
}

interface TeamCreateResponse {
  teamId: number
  teamName: string
}

/** 팀 생성 — 폼 값 + 업로드로 받은 documentStorageKey를 함께 전송 */
export async function createTeam(
  input: CreateTeamInput,
  documentStorageKey: string,
): Promise<CreatedTeam> {
  const result = await unwrap<TeamCreateResponse>(
    api.post(API_ENDPOINTS.teams, {
      teamName: input.teamName,
      companyName: input.businessName,
      representativeName: input.ceoName,
      businessNumber: input.registrationNumber,
      businessOpeningDate: input.openedAt,
      documentStorageKey,
    }),
  )
  return { id: result.teamId, name: result.teamName }
}

interface TeamInviteCodeResponse {
  inviteCode: string
  inviteCodeExpiresAt: string
}

/** 초대 코드 발급 — 생성 완료 화면에서 팀 코드를 얻는다 */
export async function issueInviteCode(teamId: number): Promise<TeamInviteCode> {
  const result = await unwrap<TeamInviteCodeResponse>(
    api.post(API_ENDPOINTS.teamInviteCode(teamId)),
  )
  return { code: result.inviteCode, expiresAt: result.inviteCodeExpiresAt }
}

interface TeamJoinResponse {
  teamId: number
  teamName: string
  role: TeamRole
}

/** 팀 합류 — 초대 코드로 합류 */
export async function joinTeam(inviteCode: string): Promise<JoinedTeam> {
  const result = await unwrap<TeamJoinResponse>(
    api.post(API_ENDPOINTS.teamJoin, { inviteCode }),
  )
  return { id: result.teamId, name: result.teamName, role: result.role }
}

/**
 * 팀 코드 이메일 일괄 전송 — 백엔드에 대응 엔드포인트가 없어 임시 no-op(mock).
 * (초대는 공유 코드 방식이며, 이메일 발송 API 확정 시 본문을 교체한다)
 */
export async function sendTeamInvites(
  _teamId: number,
  _emails: string[],
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600))
}
