import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Header from '@/components/ui/Header'

// 헤더 — 로그인 여부 2변형 (Login=False/True)
const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    login: { control: 'boolean' },
    avatarSrc: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Header>

/** Login=False / Login=True 나란히 비교 */
export const Variants: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-6 bg-bg-primary p-x6">
      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          Login=False
        </h3>
        <Header />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-label-1-normal-bold text-text-secondary">
          Login=True
        </h3>
        <Header login />
      </div>
    </div>
  ),
}

/** 인터랙티브 — 로그인 버튼 클릭 시 로그인 상태로 전환 */
function InteractiveExample() {
  const [login, setLogin] = useState(false)
  return (
    <div className="font-sans bg-bg-primary p-x6">
      <Header
        login={login}
        onLoginClick={() => setLogin(true)}
        onProfileClick={() => setLogin(false)}
      />
      <p className="mt-3 text-caption-1-regular text-text-caption">
        {login
          ? '로그인 상태 — 프로필 클릭 시 로그아웃'
          : '비로그인 상태 — 로그인 버튼 클릭 시 전환'}
      </p>
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveExample />,
}
