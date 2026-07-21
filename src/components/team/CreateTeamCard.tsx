import type { FormEvent } from 'react'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { ChevronLeft } from 'lucide-react'
import CreateTeamForm from '@/components/team/CreateTeamForm'
import LicenseDropzone from '@/components/team/LicenseDropzone'
import type { UploadStatus } from '@/components/team/LicenseDropzone'
import OnboardingCard from '@/components/team/OnboardingCard'
import { Icon } from '@/components/ui'
import type { CreateTeamFormValues } from '@/lib/team-schema'

export interface CreateTeamCardProps {
  uploadStatus: UploadStatus
  onFileSelect: (file: File) => void
  register: UseFormRegister<CreateTeamFormValues>
  control: Control<CreateTeamFormValues>
  errors: FieldErrors<CreateTeamFormValues>
  onSubmit: (e: FormEvent) => void
  canSubmit: boolean
  isSubmitting: boolean
  onBack: () => void
}

/**
 * 팀 생성 카드 — 헤더 + 사업자등록증 드롭존 + 팀 정보 폼 조합
 */
export default function CreateTeamCard({
  uploadStatus,
  onFileSelect,
  register,
  control,
  errors,
  onSubmit,
  canSubmit,
  isSubmitting,
  onBack,
}: CreateTeamCardProps) {
  return (
    <OnboardingCard className="w-[996px] max-w-full gap-x8 p-x5">
      <header className="relative flex flex-col items-center gap-x2 text-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={onBack}
          className="absolute left-0 top-0 flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-x1 text-text-primary interaction-normal"
        >
          <Icon icon={ChevronLeft} size="large" />
        </button>
        <h1 className="text-title-3-bold text-text-primary">팀 생성하기</h1>
        <p className="text-body-1-normal-regular text-text-primary">
          옥외광고 효과를 함께 측정하고 관리할 팀을 만들어주세요.
        </p>
      </header>

      <div className="flex flex-col gap-x5 md:flex-row">
        <div className="h-[408px] w-full shrink-0 md:w-[448px]">
          <LicenseDropzone status={uploadStatus} onFileSelect={onFileSelect} />
        </div>

        <CreateTeamForm
          register={register}
          control={control}
          errors={errors}
          onSubmit={onSubmit}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </OnboardingCard>
  )
}
