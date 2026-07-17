/**
 * 팀 API — 온보딩(생성·합류·초대코드)과 팀 관리(멤버·권한·나가기)를 함께 담는다.
 * 함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 TeamApiError로 throw한다(호출부는 message만 표시).
 *
 * 백엔드 미지원 기능은 목/로컬 처리한다(디자인 유지, 있는 API만 연결):
 * - 팀명 수정: 엔드포인트 없음 → updateTeamName은 로컬 반영만
 * - 이메일 초대 발송: 코드 공유 모델만 존재 → sendTeamInvites는 목 유지
 */
import { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { z } from 'zod'
import { maskDateInput } from '@/components/ui/date'
import { api } from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'
import { maskRegistrationNumber } from './team-format'

export const TEAM_ROLE = ['OWNER', 'ADMIN', 'MEMBER'] as const
export type TeamRole = (typeof TEAM_ROLE)[number]

/** 역할 표기 라벨 — 역할 배지·권한 부여 드롭다운 공통(Figma 한국어 표기) */
export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '팀원',
}

// --- 온보딩 (팀 생성·합류) -------------------------------------------------

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

export interface JoinedTeam {
  id: number
  name: string
  role: TeamRole
}

// --- 팀 관리 (멤버·권한) ---------------------------------------------------

export interface Team {
  id: number
  name: string
}

export interface TeamMember {
  /** 유저 식별자 — 역할 변경·삭제 API 경로 대상이자 내 행(isMe) 판별 기준 */
  userId: number
  name: string
  email: string
  role: TeamRole
  /** 서버가 판별한 내 행 여부 — Me 배지 표시·메뉴 숨김 */
  isMe: boolean
  /** 합류 일시(ISO) */
  joinedAt: string
  /** 목록 응답엔 없음 — 없으면 이름 이니셜로 대체 */
  profileImageUrl?: string
}

export interface TeamMembersResult {
  teamId: number
  teamName: string
  members: TeamMember[]
}

/** 초대 큐 항목 — Owner는 초대로 부여할 수 없고(권한 이전 전용) 타입 레벨에서 차단 */
export interface InviteEntry {
  email: string
  role: Exclude<TeamRole, 'OWNER'>
}

/** 권한 변경/이전 응답 — Owner 이전 시 기존 소유자 강등까지 담겨 온다 */
export interface UpdatedMemberRole {
  userId: number
  role: TeamRole
}

/** 초대 이메일 1건 검증 — 초대 모달 '추가' 버튼 활성 조건 */
export const inviteEmailSchema = z
  .string()
  .trim()
  .min(1, '이메일을 입력해 주세요.')
  .email('올바른 이메일 형식이 아닙니다.')

export interface TeamInviteCode {
  code: string
  expiresAt: string
}

// --- 공통 인프라 -----------------------------------------------------------

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

// --- 팀 관리 API -----------------------------------------------------------

interface TeamMemberResponse {
  userId: number
  displayName: string
  email: string
  role: TeamRole
  isMe: boolean
  joinedAt: string
  profileImageUrl?: string
}

interface TeamMembersResponse {
  teamId: number
  teamName: string
  members: TeamMemberResponse[]
}

/** 팀원 목록 + 팀명 조회 — 팀명은 이 응답에서 함께 온다(별도 팀 조회 없음) */
export async function fetchTeamMembers(
  teamId: number,
): Promise<TeamMembersResult> {
  const result = await unwrap<TeamMembersResponse>(
    api.get(API_ENDPOINTS.teamMembers(teamId)),
  )
  return {
    teamId: result.teamId,
    teamName: result.teamName,
    members: result.members.map((m) => ({
      userId: m.userId,
      name: m.displayName,
      email: m.email,
      role: m.role,
      isMe: m.isMe,
      joinedAt: m.joinedAt,
      profileImageUrl: m.profileImageUrl,
    })),
  }
}

/**
 * 팀원 역할 변경 · Owner 이전(동일 엔드포인트).
 * 응답 updatedMembers[]에는 이전 시 강등된 기존 Owner까지 포함되므로 그대로 상태에 반영한다.
 */
export async function updateMemberRole(
  teamId: number,
  userId: number,
  role: TeamRole,
): Promise<UpdatedMemberRole[]> {
  const result = await unwrap<{ updatedMembers: UpdatedMemberRole[] }>(
    api.patch(API_ENDPOINTS.teamMemberRole(teamId, userId), { role }),
  )
  return result.updatedMembers
}

/** 팀원 삭제 */
export async function removeMember(
  teamId: number,
  userId: number,
): Promise<void> {
  await unwrap<void>(api.delete(API_ENDPOINTS.teamMember(teamId, userId)))
}

/** 팀 나가기 */
export async function leaveTeam(teamId: number): Promise<void> {
  await unwrap<void>(api.delete(API_ENDPOINTS.teamLeave(teamId)))
}

// --- 온보딩 API ------------------------------------------------------------

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

/** 초대 코드 발급 — 온보딩 완료 화면·팀원 초대 모달에서 팀 코드를 얻는다 */
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

// --- 백엔드 미지원 — 디자인 유지를 위한 목/로컬 처리 (엔드포인트 확정 시 교체) ---

/** 팀명 변경 — 백엔드 엔드포인트 없음. 호출부에서 로컬 낙관적 반영만 한다 */
export async function updateTeamName(
  _teamId: number,
  _name: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))
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
