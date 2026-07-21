import { useId, useState } from 'react'
import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import {
  Button,
  DatePicker,
  DateTrigger,
  InputField,
  MainOverlay,
  Textarea,
} from '@/components/ui'
import { campaignInfoSchema } from '@/lib/campaign'
import type { CampaignInfoValues } from '@/lib/campaign'

export interface CampaignInfoFormProps {
  // 폼 인스턴스는 부모(위저드 페이지)가 소유 — 단계 왕복에도 입력값이 보존되도록
  form: UseFormReturn<CampaignInfoValues>
  /** 영상 미리보기(썸네일)가 준비됐는지 — '다음' 활성 조건에 폼 유효성과 함께 포함 */
  uploadReady: boolean
  onNext: () => void
}

/** 캠페인 기본 정보 폼 카드 — 캠페인명/브랜드명/송출기간/하루 송출 횟수/메모 + '다음' */
export default function CampaignInfoForm({
  form,
  uploadReady,
  onNext,
}: CampaignInfoFormProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form

  const [pickerOpen, setPickerOpen] = useState(false)
  // 송출기간 트리거(버튼)에 라벨·오류를 연결하기 위한 id (스크린리더 접근성)
  const periodLabelId = useId()
  const periodErrorId = useId()

  // 입력값 구독 — 다음 활성 판단 + 값이 비면 에러 대신 기본 상태로 되돌리는 데 사용
  const values = watch()
  // 다음 활성 = 폼 유효성 + 미리보기(썸네일) 준비 완료
  const canNext = uploadReady && campaignInfoSchema.safeParse(values).success

  // 입력했다가 다 지우면 에러 대신 기본 상태로 — 값이 있을 때만 에러 메시지 노출
  const shownError = (value: string | undefined, message?: string) =>
    value?.trim() ? message : undefined

  return (
    <div className="flex h-[661px] flex-1 flex-col gap-x5 rounded-x4 bg-bg-primary p-x5">
      <div className="flex flex-1 flex-col gap-x4">
        <InputField
          label="캠페인명"
          required
          placeholder="ex) 2026 썸머 프로모션"
          errorMessage={shownError(values.name, errors.name?.message)}
          {...register('name')}
        />
        <InputField
          label="브랜드명"
          required
          placeholder="광고를 집행하는 브랜드명을 입력해주세요."
          errorMessage={shownError(values.brand, errors.brand?.message)}
          {...register('brand')}
        />

        <Controller
          name="period"
          control={control}
          render={({ field, fieldState }) => {
            // 미선택(기간 없음)이면 에러 대신 기본 상태 — 값이 선택됐을 때만 에러 표기
            const periodError = field.value?.start
              ? fieldState.error
              : undefined
            return (
              <div className="flex w-full flex-col gap-x2">
                <span
                  id={periodLabelId}
                  className="flex items-center gap-xs text-label-1-normal-bold text-text-secondary"
                >
                  송출기간
                  <span aria-hidden="true" className="text-text-negative">
                    *
                  </span>
                </span>
                <DateTrigger
                  value={field.value}
                  open={pickerOpen}
                  range
                  onClick={() => setPickerOpen((prev) => !prev)}
                  onBlur={field.onBlur}
                  aria-labelledby={periodLabelId}
                  aria-describedby={periodError ? periodErrorId : undefined}
                  aria-invalid={periodError ? true : undefined}
                  className={[
                    'w-full justify-between border',
                    periodError
                      ? 'border-line-negative'
                      : 'border-line-secondary',
                  ].join(' ')}
                />
                {periodError && (
                  <p
                    id={periodErrorId}
                    className="text-caption-1-regular text-text-negative"
                  >
                    {periodError.message}
                  </p>
                )}
                {pickerOpen && (
                  // LNB·헤더 제외한 본문 영역 중앙에 딤머(Dimer_Black)와 함께 렌더
                  <MainOverlay>
                    <DatePicker
                      value={field.value}
                      onApply={(range) => {
                        field.onChange(range)
                        setPickerOpen(false)
                      }}
                      onClose={() => setPickerOpen(false)}
                    />
                  </MainOverlay>
                )}
              </div>
            )
          }}
        />

        <Controller
          name="dailyPlayCount"
          control={control}
          render={({ field, fieldState }) => (
            <InputField
              label="하루 송출 횟수"
              required
              placeholder="하루동안 송출할 횟수를 입력해주세요."
              inputMode="numeric"
              maxLength={4}
              value={field.value}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))
              }
              onBlur={field.onBlur}
              errorMessage={shownError(field.value, fieldState.error?.message)}
            />
          )}
        />

        <Textarea
          label="메모"
          optional
          placeholder="최대 100글자 입력 가능"
          maxLength={100}
          errorMessage={errors.memo?.message}
          className="h-[180px]"
          {...register('memo')}
        />
      </div>

      <Button
        size="large"
        className="w-full"
        disabled={!canNext}
        onClick={onNext}
      >
        다음
      </Button>
    </div>
  )
}
