import { z } from 'zod'
import { parseDate } from '@/components/ui/date'

/** 팀 생성 폼 검증 스키마 */
export const createTeamSchema = z.object({
  teamName: z.string().trim().min(1, '팀명을 입력해 주세요.'),
  businessName: z.string().trim().min(1, '사업자명을 입력해 주세요.'),
  ceoName: z.string().trim().min(1, '대표자명을 입력해 주세요.'),
  openedAt: z.string().refine((value) => Boolean(parseDate(value)), {
    message: '개업일을 YYYY.MM.DD 형식으로 입력해 주세요.',
  }),
  registrationNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '사업자등록번호 형식이 올바르지 않습니다.'),
})

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>
