import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { inviteEmailSchema } from '@/lib/team'
import type { InviteEntry } from '@/lib/team'

interface UseTeamInviteEntriesParams {
  open: boolean
  memberEmails: string[]
}

/** 초대 큐의 이메일 검증·중복 검사·역할 변경 상태를 관리한다. */
export function useTeamInviteEntries({
  open,
  memberEmails,
}: UseTeamInviteEntriesParams) {
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [entries, setEntries] = useState<InviteEntry[]>([])

  // 모달을 다시 열면 이전 입력과 큐를 초기화해 의도치 않은 재전송을 막는다.
  useEffect(() => {
    if (!open) return
    setInput('')
    setInputError(null)
    setEntries([])
  }, [open])

  const canAdd = inviteEmailSchema.safeParse(input).success

  const onInputChange = (value: string) => {
    setInput(value)
    setInputError(null)
  }

  const onAdd = (event: FormEvent) => {
    event.preventDefault()
    const parsed = inviteEmailSchema.safeParse(input)
    if (!parsed.success) return
    const email = parsed.data
    const normalized = email.toLowerCase()
    if (entries.some((entry) => entry.email.toLowerCase() === normalized)) {
      setInputError('이미 추가된 이메일입니다.')
      return
    }
    if (memberEmails.some((member) => member.toLowerCase() === normalized)) {
      setInputError('이미 팀에 속한 멤버입니다.')
      return
    }
    setEntries((previous) => [...previous, { email, role: 'MEMBER' }])
    setInput('')
    setInputError(null)
  }

  const onRoleChange = (email: string, role: InviteEntry['role']) => {
    setEntries((previous) =>
      previous.map((entry) =>
        entry.email === email ? { ...entry, role } : entry,
      ),
    )
  }

  const onRemove = (email: string) => {
    setEntries((previous) =>
      previous.filter((entry) => entry.email !== email),
    )
  }

  return {
    input,
    inputError,
    entries,
    canAdd,
    onInputChange,
    onAdd,
    onRoleChange,
    onRemove,
  }
}
