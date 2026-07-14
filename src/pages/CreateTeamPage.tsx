import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import CreateTeamCard from '@/components/team/CreateTeamCard'
import type { UploadStatus } from '@/components/team/LicenseDropzone'
import TeamInvitePanel from '@/components/team/TeamInvitePanel'
import { useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { createTeam, uploadBusinessLicense } from '@/lib/team'
import type { Team } from '@/lib/team'
import { createTeamSchema } from '@/lib/team-schema'
import type { CreateTeamFormValues } from '@/lib/team-schema'

/**
 * 팀 생성하기 — 사업자등록증 업로드(OCR 자동 채움) + 팀 정보 폼. 생성 성공 시 초대(invite) 단계로 전환
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
  } = useForm<CreateTeamFormValues>({
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

  const canSubmit =
    uploadStatus === 'success' &&
    createTeamSchema.safeParse(watch()).success &&
    !isSubmitting

  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading')
    try {
      const ocr = await uploadBusinessLicense(file)
      reset(ocr) // OCR 결과가 새 기준값
      setUploadStatus('success')
    } catch {
      setUploadStatus('error')
    }
  }

  const onSubmit = async (values: CreateTeamFormValues) => {
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
    <CreateTeamCard
      uploadStatus={uploadStatus}
      onFileSelect={handleFileSelect}
      register={register}
      control={control}
      errors={errors}
      onSubmit={handleSubmit(onSubmit)}
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      onBack={() => navigate('/welcome')}
    />
  )
}
