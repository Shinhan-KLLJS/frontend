/**
 * 캠페인 등록 API — 현재는 프론트 전용 mock.
 * 백엔드 스펙 확정 시 이 파일의 함수 본문만 api 호출로 교체한다.
 * (함수는 ApiResponse 래퍼가 아닌 result 타입을 resolve하고, 실패는 throw — 호출부 무변경 교체 목적)
 */
import { z } from 'zod'
import type { DateRange } from '@/components/ui'

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
