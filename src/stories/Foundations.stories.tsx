import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * 디자인 토큰이 Storybook에 제대로 로드되는지 확인하는 미리보기.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Typography: Story = {
  render: () => (
    <div className="font-sans p-8">
      <p className="text-3xl font-bold">Pretendard · 프리텐다드 · Bold</p>
      <p className="text-lg">
        본문 텍스트 · The quick brown fox · 다람쥐 · Regular
      </p>
      <p className="text-sm text-gray-500">
        색 · 타이포 스케일 · 레이아웃 토큰은 DV-57 / DV-58 / DV-59에서
        추가됩니다.
      </p>
    </div>
  ),
}
