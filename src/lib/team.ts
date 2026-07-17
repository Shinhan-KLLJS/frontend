/**
 * 팀 관리 API (DV-165).
 * 함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 TeamApiError로 throw한다(호출부는 message만 표시).
 *
 * 백엔드 미지원 기능은 목/로컬 처리한다(디자인 유지, 있는 API만 연결):
 * - 팀명 수정: 엔드포인트 없음 → updateTeamName은 로컬 반영만
 * - 이메일 초대 발송: 코드 공유 모델만 존재 → sendTeamInvites는 목 유지
 */
import { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { z } from 'zod'
import { api } from './api'
import type { ApiResponse } from './api'
import { API_ENDPOINTS } from './config'

export const TEAM_ROLE = ['OWNER', 'ADMIN', 'MEMBER'] as const
export type TeamRole = (typeof TEAM_ROLE)[number]

/** 역할 표기 라벨 — Figma 원문의 'Onwer' 오타는 Owner로 교정해 사용 */
export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
}

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

/** 초대 코드 발급 결과 */
export interface TeamInviteCode {
  code: string
  expiresAt: string
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

interface InviteCodeResponse {
  inviteCode: string
  inviteCodeExpiresAt: string
}

/** 초대 코드 발급 — 모달 오픈 시 호출해 복사 대상 코드를 받아온다 */
export async function issueInviteCode(
  teamId: number,
): Promise<TeamInviteCode> {
  const result = await unwrap<InviteCodeResponse>(
    api.post(API_ENDPOINTS.teamInviteCode(teamId)),
  )
  return { code: result.inviteCode, expiresAt: result.inviteCodeExpiresAt }
}

// ---------------------------------------------------------------------------
// 백엔드 미지원 — 디자인 유지를 위한 목/로컬 처리 (엔드포인트 확정 시 교체)
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 팀명 변경 — 백엔드 엔드포인트 없음. 호출부에서 로컬 낙관적 반영만 한다 */
export async function updateTeamName(
  _teamId: number,
  _name: string,
): Promise<void> {
  await delay(200)
}

/** 팀 코드 전송(이메일 초대) — 백엔드 미지원(코드 공유 모델). 목: 'fail' 포함 이메일이 있으면 실패 */
export async function sendTeamInvites(
  _teamId: number,
  entries: InviteEntry[],
): Promise<void> {
  await delay(1000)
  if (entries.some((entry) => entry.email.toLowerCase().includes('fail'))) {
    throw new TeamApiError('TEAM4001', '팀 코드 전송에 실패했습니다.')
  }
}
