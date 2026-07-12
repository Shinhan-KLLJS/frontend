import type { Meta, StoryObj } from '@storybook/react-vite'
import DateTrigger from '@/components/ui/DateTrigger'

// Date 트리거 - 데이트 피커를 여는 버튼
const meta: Meta<typeof DateTrigger> = {
  title: 'Components/DateTrigger',
  component: DateTrigger,
  parameters: { layout: 'padded' },
  argTypes: {
    open: { control: 'boolean' },
    value: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof DateTrigger>

export const Default: Story = {
  args: { open: false },
}

// 표기는 하루(시작=종료)는 날짜 1개, 기간(시작≠종료)은 '시작-종료'
export const Variants: Story = {
  render: () => (
    <div className="font-sans flex flex-col items-start gap-5 bg-bg-primary p-x4">
      {(
        [
          ['미선택 · 닫힘 — 1일 placeholder', <DateTrigger key="closed" />],
          ['미선택 · 열림 — 쉐브론 위', <DateTrigger key="open" open />],
          [
            '하루 선택 (시작=종료) — 날짜 1개',
            <DateTrigger
              key="one"
              value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 5) }}
            />,
          ],
          [
            '기간 선택 (시작≠종료) — 시작-종료',
            <DateTrigger
              key="range"
              value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 8) }}
            />,
          ],
        ] as const
      ).map(([label, node]) => (
        <div key={label} className="flex flex-col items-start gap-2">
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {label}
          </h3>
          {node}
        </div>
      ))}
    </div>
  ),
}
