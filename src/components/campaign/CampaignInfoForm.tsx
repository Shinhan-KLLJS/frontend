import { useEffect, useId, useRef, useState } from 'react'
import { Controller } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import {
  Button,
  DatePicker,
  DateTrigger,
  InputField,
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
  const periodRef = useRef<HTMLDivElement>(null)

  // DatePicker 오버레이 외부 클릭 닫기 (Dropdown 패턴)
  useEffect(() => {
    if (!pickerOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (
        periodRef.current &&
        !periodRef.current.contains(event.target as Node)
      ) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [pickerOpen])

  // 다음 활성 = 폼 유효성 + 미리보기(썸네일) 준비 완료
  const canNext = uploadReady && campaignInfoSchema.safeParse(watch()).success

  return (
    <div className="flex min-w-[470px] flex-1 flex-col gap-x5 self-stretch rounded-x4 bg-bg-primary p-x5">
      <div className="flex flex-1 flex-col gap-x4">
        <InputField
          label="캠페인명"
          required
          placeholder="ex) 2026 썸머 프로모션"
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <InputField
          label="브랜드명"
          required
          placeholder="ex) Loovi"
          errorMessage={errors.brand?.message}
          {...register('brand')}
        />

        <Controller
          name="period"
          control={control}
          render={({ field, fieldState }) => (
            <div
              ref={periodRef}
              className="relative flex w-full flex-col gap-x2"
            >
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
                onClick={() => setPickerOpen((prev) => !prev)}
                onBlur={field.onBlur}
                aria-labelledby={periodLabelId}
                aria-describedby={fieldState.error ? periodErrorId : undefined}
                aria-invalid={fieldState.error ? true : undefined}
                className={[
                  'w-full justify-between border',
                  fieldState.error
                    ? 'border-line-negative'
                    : 'border-line-secondary',
                ].join(' ')}
              />
              {fieldState.error && (
                <p
                  id={periodErrorId}
                  className="text-caption-1-regular text-text-negative"
                >
                  {fieldState.error.message}
                </p>
              )}
              {pickerOpen && (
                // 패널(480px)이 카드 내부 폭(430px)보다 넓어 필드 오른쪽 끝 기준으로 왼쪽으로 넘치게 띄운다
                <DatePicker
                  className="absolute right-0 top-full z-50 mt-x2"
                  value={field.value}
                  onApply={(range) => {
                    field.onChange(range)
                    setPickerOpen(false)
                  }}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>
          )}
        />

        <Controller
          name="dailyPlayCount"
          control={control}
          render={({ field, fieldState }) => (
            <InputField
              label="하루 송출 횟수"
              required
              placeholder="ex) 100"
              inputMode="numeric"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Textarea
          label="메모"
          optional
          placeholder="최대 500글자 입력 가능"
          maxLength={500}
          errorMessage={errors.memo?.message}
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
