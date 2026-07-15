/**
 * 팀 온보딩 폼 입력 마스킹
 */

/** 사업자등록번호 - 숫자만 남기고 000-00-00000 형태로 하이픈 자동 삽입 */
export function maskRegistrationNumber(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

/** 팀 코드 - 대문자·숫자 7자리만 허용 (입력 즉시 정규화) */
export function maskTeamCode(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)
}
