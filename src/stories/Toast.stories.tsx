import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/ui'
import Toast, { ToastProvider, useToast } from '@/components/ui/Toast'

// 토스트 — 화면 중앙 상단 안내 메시지 (고정폭 420, 높이는 텍스트에 따라 유동)
const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'padded' },
  argTypes: {
    status: { control: 'select', options: ['success', 'error'] },
    leadingIcon: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Toast>

export const Default: Story = {
  args: {
    message: '팀 코드를 전송했습니다.',
    status: 'success',
    leadingIcon: true,
  },
}

/** success / error / 아이콘 없음 / 긴 텍스트(높이 유동) */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-x3">
      <Toast message="팀 코드를 전송했습니다." status="success" />
      <Toast message="팀 코드 전송을 실패했습니다." status="error" />
      <Toast message="아이콘 없는 안내 메시지입니다." leadingIcon={false} />
      <Toast
        status="success"
        message="긴 메시지가 들어오면 고정폭 420px 안에서 줄바꿈되고 토스트 높이가 기본 52px에서 내용만큼 유동적으로 늘어납니다."
      />
    </div>
  ),
}

function PlaygroundDemo() {
  const { toast } = useToast()
  return (
    <div className="flex gap-x3">
      <Button size="medium" onClick={() => toast('팀 코드를 전송했습니다.')}>
        성공 토스트
      </Button>
      <Button
        size="medium"
        color="secondary"
        onClick={() =>
          toast('팀 코드 전송을 실패했습니다.', { status: 'error' })
        }
      >
        실패 토스트
      </Button>
    </div>
  )
}

/** ToastProvider + useToast — 클릭 시 중앙 상단 표시, 3초 후 자동 제거, 연속 클릭 시 세로 스택 */
export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <PlaygroundDemo />
    </ToastProvider>
  ),
}
