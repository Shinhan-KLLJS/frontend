import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TeamInviteModal from '@/components/team/TeamInviteModal'
import { ToastProvider } from '@/components/ui'
import type { InviteEntry } from '@/lib/team'

const TEAM_CODE = 'F23XR74'
// 이미 팀에 속한 이메일 — 초대 큐에 같은 주소를 추가하려 하면 1차 차단된다.
const MEMBER_EMAILS = ['jeongheon.lee@naver.com', 'dabin.kang@gmail.com']

// 모달을 바로 띄운 상태. '팀 코드 전송' 시 전송 중(sending)을 잠깐 보였다가 닫는다.
function Demo() {
  const [open, setOpen] = useState(true)
  const [sending, setSending] = useState(false)

  const handleSend = (_entries: InviteEntry[]) => {
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      setOpen(false)
    }, 1200)
  }

  return (
    <div className="h-[600px] bg-bg-secondary">
      <TeamInviteModal
        open={open}
        teamCode={TEAM_CODE}
        memberEmails={MEMBER_EMAILS}
        sending={sending}
        onClose={() => setOpen(false)}
        onSend={handleSend}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Pages/Team/3) 팀원 초대 모달',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
}
export default meta
type Story = StoryObj

export const Open: Story = {
  name: '초대 모달',
  render: () => <Demo />,
}
