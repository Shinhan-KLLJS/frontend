import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JoinTeamCard from '@/components/team/JoinTeamCard'
import { useToast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { ROUTES } from '@/lib/routes'
import { joinTeam, TeamApiError } from '@/lib/team'

type JoinState = 'idle' | 'submitting' | 'error'

/**
 * 팀 합류하기 — 팀 코드 입력. 코드가 확인되면 해당 팀에 합류하고 홈으로 이동.
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

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (joinState === 'error') {
      setJoinState('idle')
      setErrorMessage('')
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setJoinState('submitting')
    try {
      const team = await joinTeam(code.trim())
      updateUser({ hasTeam: true, teamId: team.id })
      toast(`${team.name} 팀에 합류했습니다.`, { status: 'success' })
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      setJoinState('error')
      setErrorMessage(
        err instanceof TeamApiError
          ? err.message
          : '올바른 팀 코드를 입력하세요.',
      )
    }
  }

  return (
    <JoinTeamCard
      code={code}
      onCodeChange={handleCodeChange}
      onSubmit={handleSubmit}
      errorMessage={joinState === 'error' ? errorMessage : undefined}
      submitting={joinState === 'submitting'}
      canSubmit={canSubmit}
    />
  )
}
