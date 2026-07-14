import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import LicenseDropzone from '@/components/team/LicenseDropzone'
import type { UploadStatus } from '@/components/team/LicenseDropzone'
import TeamInvitePanel from '@/components/team/TeamInvitePanel'
import { Button, Icon, InputField, useToast } from '@/components/ui'
import { maskDateInput, parseDate } from '@/components/ui/date'
import { useAuth } from '@/lib/auth'
import { createTeam, uploadBusinessLicense } from '@/lib/team'
import type { Team } from '@/lib/team'

const createTeamSchema = z.object({
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

type CreateTeamForm = z.infer<typeof createTeamSchema>

/** 사업자등록번호 마스킹 — 숫자만 남기고 000-00-00000 형태로 하이픈 자동 삽입 */
function maskRegistrationNumber(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

/**
 * 팀 생성하기 — 사업자등록증 업로드(OCR 자동 채움) + 팀 정보 폼.
 * 생성 성공 시 초대(invite) 단계로 전환 — updateUser는 초대 화면의 "홈으로 이동"에서 호출한다
 * (여기서 hasTeam을 올리면 OnboardingLayout 가드에 걸려 초대 화면이 홈으로 튕긴다)
 */
export default function CreateTeamPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { toast } = useToast()

  const [phase, setPhase] = useState<'form' | 'invite'>('form')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    mode: 'onTouched',
    defaultValues: {
      teamName: '',
      businessName: '',
      ceoName: '',
      openedAt: '',
      registrationNumber: '',
    },
  })

  // 디자인 기준: 유효한 사업자등록증 업로드가 팀 생성의 전제 (업로드 실패 시 폼이 채워져 있어도 비활성)
  const canSubmit =
    uploadStatus === 'success' &&
    createTeamSchema.safeParse(watch()).success &&
    !isSubmitting

  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading')
    try {
      const ocr = await uploadBusinessLicense(file)
      reset(ocr) // OCR 결과가 새 기준값 — setValue 반복 대신 reset으로 채운다
      setUploadStatus('success')
    } catch {
      setUploadStatus('error')
    }
  }

  const onSubmit = async (values: CreateTeamForm) => {
    try {
      const team = await createTeam(values)
      setCreatedTeam(team)
      setPhase('invite')
    } catch {
      toast('팀 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.', {
        status: 'error',
      })
    }
  }

  if (phase === 'invite' && createdTeam) {
    return (
      <TeamInvitePanel
        team={createdTeam}
        onGoHome={() => {
          updateUser({ hasTeam: true, teamId: createdTeam.id })
          navigate('/', { replace: true })
        }}
      />
    )
  }

  return (
    <section className="flex w-[1080px] max-w-full flex-col gap-x6 rounded-x4 bg-bg-secondary p-x10 shadow-[0px_10px_15px_-5px_rgba(23,23,23,0.1),0px_24px_38px_-10px_rgba(23,23,23,0.12)]">
      <header className="relative flex flex-col items-center gap-x2 text-center">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate('/welcome')}
          className="absolute left-0 top-x1 cursor-pointer rounded-x1 text-text-primary interaction-normal"
        >
          <Icon icon={ChevronLeft} size="large" />
        </button>
        <h1 className="text-title-3-bold text-text-primary">팀 생성하기</h1>
        <p className="text-label-1-normal-regular text-text-secondary">
          옥외광고 효과를 함께 측정하고 관리할 팀을 만드세요.
        </p>
      </header>

      <div className="flex flex-col gap-x5 md:flex-row">
        <div className="min-h-[420px] shrink-0 md:w-[356px]">
          <LicenseDropzone status={uploadStatus} onFileSelect={handleFileSelect} />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-w-0 flex-1 flex-col gap-x4"
        >
          <InputField
            label="팀명"
            required
            placeholder="소속 팀명을 입력하세요"
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
          <div className="flex flex-col gap-x4 sm:flex-row">
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
      </div>
    </section>
  )
}
