import type { FormEvent } from 'react'
import { Button, InputField } from '@/components/ui'
import OnboardingCard from '@/components/team/OnboardingCard'
import { maskTeamCode } from '@/lib/team-format'

export interface JoinTeamCardProps {
  code: string
  onCodeChange: (value: string) => void
  onSubmit: () => void
  errorMessage?: string
  submitting?: boolean
  canSubmit?: boolean
}

/**
 * 팀 합류 카드 - hero + 코드 입력 + 제출 버튼.
 */
export default function JoinTeamCard({
  code,
  onCodeChange,
  onSubmit,
  errorMessage,
  submitting = false,
  canSubmit = false,
}: JoinTeamCardProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <OnboardingCard
      as="form"
      onSubmit={handleSubmit}
      className="h-[584px] w-[590px] max-w-full px-x8 py-x10"
    >
      <div className="flex flex-1 flex-col gap-x6">
        <div className="flex flex-col items-center gap-x2 rounded-x4 bg-gradient-to-b from-[var(--blue-100)] via-[var(--blue-50)] to-bg-secondary px-x5 py-x10 text-center">
          <h1 className="text-title-3-bold text-text-primary">팀 합류하기</h1>
          <p className="text-body-1-normal-regular text-text-secondary">
            팀 코드를 입력하세요. 코드가 확인되면 해당 팀에 합류합니다.
          </p>
        </div>

        <InputField
          aria-label="팀 코드"
          placeholder="팀 코드를 입력하세요"
          value={code}
          maxLength={7}
          onChange={(e) => onCodeChange(maskTeamCode(e.target.value))}
          errorMessage={errorMessage}
        />
      </div>

      <Button
        type="submit"
        size="large"
        className="w-full"
        disabled={!canSubmit}
      >
        {submitting ? '확인 중...' : '팀 합류하기'}
      </Button>
    </OnboardingCard>
  )
}
