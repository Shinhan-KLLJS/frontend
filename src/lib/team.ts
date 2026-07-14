/**
 * 팀 온보딩 API — 현재는 프론트 전용 mock.
 * 백엔드 스펙 확정 시 이 파일의 함수 본문만 api 호출로 교체한다.
 * (함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 throw — 호출부 무변경 교체 목적)
 */

export interface Team {
  id: number
  name: string
  code: string // 7자리 대문자·숫자 팀 코드 (예: F23XR74)
}

export interface CreateTeamInput {
  teamName: string
  businessName: string
  ceoName: string
  openedAt: string // 'YYYY.MM.DD'
  registrationNumber: string // '000-00-00000'
}

/** 사업자등록증 OCR 추출 결과 — 폼 reset에 그대로 사용하도록 CreateTeamInput과 동일 필드 */
export type BusinessLicenseInfo = CreateTeamInput

/** 백엔드 ApiResponse의 code/message를 보존하는 에러 — 호출부는 message만 표시 */
export class TeamApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'TeamApiError'
    this.code = code
  }
}

const TEAM_CODE_PATTERN = /^[A-Z0-9]{7}$/

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 7자리 대문자·숫자 팀 코드 생성 (mock 전용) */
function generateTeamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(
    { length: 7 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('')
}

/** 팀 코드로 팀 합류 — mock: 7자리 형식이면 성공, 아니면 검증 실패로 취급 */
export async function joinTeam(code: string): Promise<Team> {
  await delay(900)
  if (!TEAM_CODE_PATTERN.test(code)) {
    throw new TeamApiError(
      'TEAM4001',
      '팀 코드가 올바르지 않습니다. 다시 시도해 주세요.',
    )
  }
  return { id: 1, name: '신한 KLLJS 딥비전스', code }
}

/**
 * 사업자등록증 업로드 + OCR 추출 — mock: 파일명에 'fail' 포함 시 실패(에러 화면 재현용).
 * teamName은 실제 OCR 결과에 없을 수 있어 사업자명과 동일값으로 채운다.
 */
export async function uploadBusinessLicense(
  file: File,
): Promise<BusinessLicenseInfo> {
  await delay(2000)
  if (file.name.toLowerCase().includes('fail')) {
    throw new TeamApiError(
      'TEAM4002',
      '사업자등록증 업로드에 실패했습니다. 다시 시도해 주세요.',
    )
  }
  return {
    teamName: '신한 킬즈 KLLJS 1팀',
    businessName: '신한 킬즈 KLLJS',
    ceoName: '가나다',
    openedAt: '2014.03.24',
    registrationNumber: '684-21-13592',
  }
}

/** 팀 생성 — mock: 입력한 팀명 + 랜덤 팀 코드 반환 */
export async function createTeam(input: CreateTeamInput): Promise<Team> {
  await delay(1200)
  return { id: 1, name: input.teamName, code: generateTeamCode() }
}

/** 팀 코드 이메일 일괄 전송 — mock: 항상 성공 */
export async function sendTeamInvites(
  _teamId: number,
  _emails: string[],
): Promise<void> {
  await delay(900)
}
