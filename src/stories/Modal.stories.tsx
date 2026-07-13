import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Modal from '@/components/ui/Modal'
import { Button, ToastProvider, useToast } from '@/components/ui'

// 모달 — 중앙 확인 다이얼로그
const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    cancelText: { control: 'text' },
    confirmText: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Modal>

export const Default: Story = {
  args: {
    open: true,
    title: '광고 등록을 취소할까요?',
    body: '작성 중인 내용은 저장되지 않아요.',
    cancelText: '아니요',
    confirmText: '네',
  },
}

function PlaygroundDemo() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  return (
    <div className="flex h-[400px] items-center justify-center">
      <Button size="medium" onClick={() => setOpen(true)}>
        모달 열기
      </Button>
      <Modal
        open={open}
        title="광고 등록을 취소할까요?"
        body="작성 중인 내용은 저장되지 않아요."
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          toast('광고 등록을 취소했습니다.')
        }}
      />
    </div>
  )
}

/** 버튼으로 열고 아니요/백드롭/ESC로 닫는 실사용 시나리오 — 네 클릭 시 토스트 */
export const Playground: Story = {
  render: () => (
    <ToastProvider>
      <PlaygroundDemo />
    </ToastProvider>
  ),
}
