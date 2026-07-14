import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, InputField, useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { joinTeam, TeamApiError } from '@/lib/team'

type JoinState = 'idle' | 'submitting' | 'error'

/**
 * 팀 합류하기 — 팀 코드 입력. 코드가 확인되면 해당 팀에 합류하고 홈으로 이동
 */
export default function JoinTeamPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const { toast } = useToast()

  const [code, setCode] = useState('')
  const [joinState, setJoinState] = useState<JoinState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // 실패 후에는 재입력 전까지 버튼 비활성 (디자인의 Fail 상태)
  const canSubmit = code.trim() !== '' && joinState === 'idle'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setJoinState('submitting')
    try {
      const team = await joinTeam(code.trim())
      updateUser({ hasTeam: true, teamId: team.id })
      toast(`${team.name} 팀에 합류했습니다.`, { status: 'success' })
      navigate('/', { replace: true })
    } catch (err) {
      setJoinState('error')
      setErrorMessage(
        err instanceof TeamApiError
          ? err.message
          : '팀 합류에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-[460px] w-[472px] flex-col gap-x5 rounded-x4 bg-bg-secondary p-x6 shadow-[0px_10px_15px_-5px_rgba(23,23,23,0.1),0px_24px_38px_-10px_rgba(23,23,23,0.12)]"
    >
      <div className="flex flex-col items-center gap-x2 rounded-x3 bg-gradient-to-b from-[var(--blue-100)] via-[var(--blue-50)] to-bg-secondary px-x5 py-x10 text-center">
        <h1 className="text-title-3-bold text-text-primary">팀 합류하기</h1>
        <p className="text-label-1-normal-regular text-text-secondary">
          팀 코드를 입력하세요. 코드가 확인되면 해당 팀에 합류합니다.
        </p>
      </div>

      <InputField
        aria-label="팀 코드"
        placeholder="팀 코드를 입력해 주세요."
        value={code}
        maxLength={7}
        onChange={(e) => {
          // 팀 코드는 대문자·숫자 조합 — 입력 즉시 대문자로 통일하고 에러 상태 해제
          setCode(e.target.value.toUpperCase())
          if (joinState === 'error') {
            setJoinState('idle')
            setErrorMessage('')
          }
        }}
        errorMessage={joinState === 'error' ? errorMessage : undefined}
      />

      <Button
        type="submit"
        size="large"
        className="mt-auto w-full"
        disabled={!canSubmit}
      >
        {joinState === 'submitting' ? '확인 중...' : '팀 합류하기'}
      </Button>
    </form>
  )
}
