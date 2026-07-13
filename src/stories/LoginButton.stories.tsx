import type { Meta, StoryObj } from '@storybook/react-vite'
import LoginButton, { LOGIN_PROVIDER } from '@/components/ui/LoginButton'

// 소셜 간편 로그인 버튼 — kakao / google / naver
const meta: Meta<typeof LoginButton> = {
  title: 'Components/LoginButton',
  component: LoginButton,
  argTypes: {
    provider: { control: 'select', options: [...LOGIN_PROVIDER] },
    children: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof LoginButton>

export const Default: Story = {
  args: {
    provider: 'kakao',
  },
  render: (args) => (
    <div className="w-[480px]">
      <LoginButton {...args} />
    </div>
  ),
}

/** 매트릭스 : Provider(kakao/google/naver) */
export const States: Story = {
  render: () => (
    <section className="font-sans flex w-[512px] flex-col gap-x4 rounded-lg border border-line-tertiary bg-bg-secondary p-x4">
      {LOGIN_PROVIDER.map((provider) => (
        <LoginButton key={provider} provider={provider} />
      ))}
    </section>
  ),
}
