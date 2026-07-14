import { useState } from 'react'
import type { FormEvent } from 'react'
import { Copy, Link, X } from 'lucide-react'
import { z } from 'zod'
import { Button, Icon, InputField, useToast } from '@/components/ui'
import { sendTeamInvites } from '@/lib/team'
import type { Team } from '@/lib/team'

const emailSchema = z.string().email('이메일 형식이 올바르지 않습니다.')

export interface TeamInvitePanelProps {
  team: Team
  // updateUser(hasTeam) + 홈 이동은 부모 소유 — 여기서 올리면 온보딩 가드에 걸려 이 화면이 먼저 닫힌다
  onGoHome: () => void
}

/**
 * 팀 생성 완료 — 팀 코드 복사 + 이메일 초대 리스트 + 팀 코드 일괄 전송
 */
export default function TeamInvitePanel({ team, onGoHome }: TeamInvitePanelProps) {
  const { toast } = useToast()

  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [sending, setSending] = useState(false)

  const copyTeamCode = async () => {
    try {
      await navigator.clipboard.writeText(team.code)
      toast('팀 코드가 복사되었습니다.', { status: 'success' })
    } catch {
      toast('복사에 실패했습니다. 팀 코드를 직접 선택해 주세요.', {
        status: 'error',
      })
    }
  }

  const addEmail = (e: FormEvent) => {
    e.preventDefault()
    const value = emailInput.trim()
    const parsed = emailSchema.safeParse(value)
    if (!parsed.success) {
      setInputError(parsed.error.issues[0].message)
      return
    }
    // 대소문자만 다른 중복 방지를 위해 소문자 정규화 비교
    if (emails.some((email) => email.toLowerCase() === value.toLowerCase())) {
      setInputError('이미 추가된 이메일입니다.')
      return
    }
    setEmails((prev) => [...prev, value])
    setEmailInput('')
    setInputError('')
  }

  const removeEmail = (target: string) => {
    setEmails((prev) => prev.filter((email) => email !== target))
  }

  const sendInvites = async () => {
    setSending(true)
    try {
      await sendTeamInvites(team.id, emails)
      toast(`${emails.length}명에게 팀 코드를 전송했습니다.`, {
        status: 'success',
      })
    } catch {
      toast('팀 코드 전송에 실패했습니다. 다시 시도해 주세요.', {
        status: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="flex w-[840px] max-w-full flex-col gap-x5 rounded-x4 bg-bg-secondary p-x10 shadow-[0px_10px_15px_-5px_rgba(23,23,23,0.1),0px_24px_38px_-10px_rgba(23,23,23,0.12)]">
      <header className="flex flex-col items-center gap-x2 text-center">
        <h1 className="text-title-3-bold text-text-primary">
          {team.name} 생성 완료!
        </h1>
        <p className="text-label-1-normal-regular text-text-secondary">
          Loovi에서 팀원과 함께 옥외광고 캠페인을 관리하고 효과를 분석하세요.
        </p>
      </header>

      <div className="flex flex-col gap-x2">
        <span className="text-label-1-normal-bold text-text-primary">
          팀 코드
        </span>
        <div className="flex items-center gap-x3 rounded-x2 border border-line-secondary bg-bg-secondary px-x4 py-x3">
          <Icon icon={Link} size="medium" color="tertiary" />
          <span className="flex-1 text-body-1-normal-regular text-text-primary">
            {team.code}
          </span>
          <button
            type="button"
            aria-label="팀 코드 복사"
            onClick={copyTeamCode}
            className="cursor-pointer rounded-x1 p-x1 text-text-secondary interaction-normal"
          >
            <Icon icon={Copy} size="medium" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-x4 rounded-x3 bg-bg-primary p-x4">
        <form onSubmit={addEmail} className="flex items-start gap-x2">
          <InputField
            aria-label="초대할 이메일"
            placeholder="초대할 이메일을 입력하세요"
            className="flex-1"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value)
              if (inputError) setInputError('')
            }}
            errorMessage={inputError || undefined}
          />
          <Button
            type="submit"
            color="secondary"
            size="large"
            disabled={emailInput.trim() === ''}
          >
            추가
          </Button>
        </form>

        <p className="text-label-1-normal-bold text-text-primary">
          초대 인원 <span className="text-text-brand">{emails.length}명</span>
        </p>

        <ul className="flex min-h-[96px] flex-col gap-x2">
          {emails.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between rounded-x2 bg-bg-secondary px-x4 py-x2"
            >
              <span className="text-label-1-normal-regular text-text-primary">
                {email}
              </span>
              <button
                type="button"
                aria-label={`${email} 삭제`}
                onClick={() => removeEmail(email)}
                className="cursor-pointer rounded-x1 p-x1 text-text-tertiary interaction-normal"
              >
                <Icon icon={X} size="small" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-x3">
        <Button
          variant="line"
          color="secondary"
          size="large"
          className="flex-1"
          disabled={emails.length === 0 || sending}
          onClick={sendInvites}
        >
          {sending ? '전송 중...' : '팀 코드 일괄 전송'}
        </Button>
        <Button size="large" className="flex-1" onClick={onGoHome}>
          홈으로 이동
        </Button>
      </div>
    </section>
  )
}
