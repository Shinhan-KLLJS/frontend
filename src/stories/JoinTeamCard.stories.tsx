import type { Meta, StoryObj } from '@storybook/react-vite'
import JoinTeamCard from '@/components/team/JoinTeamCard'

const noop = () => {}

const meta: Meta<typeof JoinTeamCard> = {
  title: 'Pages/Team/팀 합류 카드',
  component: JoinTeamCard,
  parameters: { layout: 'centered' },
  args: {
    code: '',
    onCodeChange: noop,
    onSubmit: noop,
  },
}
export default meta
type Story = StoryObj<typeof JoinTeamCard>

export const Default: Story = { name: '기본' }

export const Filled: Story = {
  name: '코드 입력됨',
  args: { code: 'ABC1234', canSubmit: true },
}
