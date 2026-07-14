/**
 * 팀 관리 API — 현재는 프론트 전용 mock.
 * 백엔드 스펙 확정 시 이 파일의 함수 본문만 api 호출로 교체한다.
 * (함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 throw — 호출부 무변경 교체 목적)
 */
import { z } from 'zod'

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
  /** 팀 초대 코드 — 초대 모달의 클립보드 복사 대상 */
  code: string
}

export interface TeamMember {
  /** 멤버십 id — 역할 변경·삭제 API의 대상 식별자 */
  id: number
  /** AuthUser.id 매칭용 — 내 행(Me 배지, 메뉴 숨김) 판별 */
  userId: number
  name: string
  email: string
  profileImageUrl?: string
  role: TeamRole
}

/** 초대 큐 항목 — Owner는 초대로 부여할 수 없고(권한 이전 전용) 타입 레벨에서 차단 */
export interface InviteEntry {
  email: string
  role: Exclude<TeamRole, 'OWNER'>
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MOCK_TEAM: Team = {
  id: 1,
  name: '신한 KLLJS 딥비전스 옥외광고 3팀',
  code: 'F23XR74',
}

// userId 0 = VITE_MOCK_AUTH 목 유저(auth.tsx MOCK_USER) — 내 행 판별 확인용.
// 마지막 멤버의 긴 이메일은 행 말줄임 검증용
const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 1,
    userId: 0,
    name: '테스트 사용자',
    email: 'dev@loovi.my',
    role: 'OWNER',
  },
  { id: 2, userId: 11, name: '손원진', email: 'KLLJS@naver.com', role: 'ADMIN' },
  {
    id: 3,
    userId: 12,
    name: '이정헌',
    email: 'KLLJS@gmail.com',
    role: 'MEMBER',
  },
  { id: 4, userId: 13, name: '강다빈', email: 'KLLJS@nate.com', role: 'MEMBER' },
  {
    id: 5,
    userId: 14,
    name: '이정윤',
    email: 'sonwer2132@naver.com',
    role: 'MEMBER',
  },
  {
    id: 6,
    userId: 15,
    name: '장세은',
    email: 'very-long-email-address-for-truncation-check@really-long-domain.example.com',
    role: 'MEMBER',
  },
]

/** 팀 정보 조회 */
export async function fetchTeam(_teamId: number): Promise<Team> {
  await delay(400)
  return MOCK_TEAM
}

/** 팀원 목록 조회 */
export async function fetchTeamMembers(
  _teamId: number,
): Promise<TeamMember[]> {
  await delay(500)
  return MOCK_MEMBERS
}

/** 팀명 변경 */
export async function updateTeamName(
  _teamId: number,
  name: string,
): Promise<Team> {
  await delay(400)
  return { ...MOCK_TEAM, name }
}

/** 팀원 역할 변경 — Owner 부여는 transferOwnership 전용(role 타입으로 오용 차단) */
export async function updateMemberRole(
  _teamId: number,
  _memberId: number,
  _role: Exclude<TeamRole, 'OWNER'>,
): Promise<void> {
  await delay(400)
}

/** Owner 권한 이전 — 대상이 OWNER가 되고 기존 소유자는 ADMIN이 되는 원자적 작업이라 별도 함수 */
export async function transferOwnership(
  _teamId: number,
  _memberId: number,
): Promise<void> {
  await delay(600)
}

/** 팀원 삭제 */
export async function removeMember(
  _teamId: number,
  _memberId: number,
): Promise<void> {
  await delay(400)
}

/** 팀 나가기 — 마지막 Owner 처리 정책(이전 강제/팀 해산)은 백엔드 확정 시 반영 */
export async function leaveTeam(_teamId: number): Promise<void> {
  await delay(600)
}

/** 팀 코드 전송(초대) — mock: 'fail' 포함 이메일이 있으면 실패(에러 토스트 재현용) */
export async function sendTeamInvites(
  _teamId: number,
  entries: InviteEntry[],
): Promise<void> {
  await delay(1000)
  if (entries.some((entry) => entry.email.toLowerCase().includes('fail'))) {
    throw new TeamApiError('TEAM4001', '팀 코드 전송에 실패했습니다.')
  }
}
