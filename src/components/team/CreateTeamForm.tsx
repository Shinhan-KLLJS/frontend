import type { FormEvent } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button, Icon, InputField } from '@/components/ui'
import { maskDateInput } from '@/components/ui/date'
import { maskRegistrationNumber } from '@/lib/team-format'
import type { CreateTeamFormValues } from '@/lib/team-schema'

export interface CreateTeamFormProps {
  register: UseFormRegister<CreateTeamFormValues>
  control: Control<CreateTeamFormValues>
  errors: FieldErrors<CreateTeamFormValues>
  onSubmit: (e: FormEvent) => void
  canSubmit: boolean
  isSubmitting: boolean
}

/**
 * 팀 생성 정보 폼 — 팀명/사업자명/대표자명/개업일/사업자등록번호.
 */
export default function CreateTeamForm({
  register,
  control,
  errors,
  onSubmit,
  canSubmit,
  isSubmitting,
}: CreateTeamFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 flex-col gap-x3">
      <InputField
        label="팀명"
        required
        placeholder="팀명을 입력하세요"
        errorMessage={errors.teamName?.message}
        {...register('teamName')}
      />
      <InputField
        label="사업자명"
        required
        placeholder="사업자명을 입력하세요"
        errorMessage={errors.businessName?.message}
        {...register('businessName')}
      />
      <div className="flex flex-col gap-x2 sm:flex-row">
        <InputField
          label="대표자명"
          required
          placeholder="대표자명을 입력하세요"
          className="flex-1"
          errorMessage={errors.ceoName?.message}
          {...register('ceoName')}
        />
        <Controller
          name="openedAt"
          control={control}
          render={({ field, fieldState }) => (
            <InputField
              label="개업일"
              required
              placeholder="YYYY.MM.DD"
              className="flex-1"
              leadingIcon={<Icon icon={Calendar} size={24} color="secondary" />}
              trailingIcon={
                <Icon icon={ChevronDown} size={20} color="secondary" />
              }
              value={field.value}
              onChange={(e) => field.onChange(maskDateInput(e.target.value))}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>
      <Controller
        name="registrationNumber"
        control={control}
        render={({ field, fieldState }) => (
          <InputField
            label="사업자등록번호"
            required
            placeholder="사업자등록번호를 입력하세요"
            value={field.value}
            onChange={(e) =>
              field.onChange(maskRegistrationNumber(e.target.value))
            }
            onBlur={field.onBlur}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <Button
        type="submit"
        size="large"
        className="mt-auto w-full"
        disabled={!canSubmit}
      >
        {isSubmitting ? '생성 중...' : '팀 생성하기'}
      </Button>
    </form>
  )
}
