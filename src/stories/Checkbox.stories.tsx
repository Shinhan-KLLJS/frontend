import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Checkbox, { CHECKBOX_SIZE } from '@/components/ui/Checkbox'

// 체크박스
const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    size: { control: 'select', options: [...CHECKBOX_SIZE] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: {
    checked: false,
    size: 20,
    children: '이메일 저장',
  },
}

/** 매트릭스 : Size(20/24) × State(unchecked/checked/disabled) */
export const States: Story = {
  render: () => (
    <div className="font-sans flex gap-x4">
      {CHECKBOX_SIZE.map((size) => (
        <section
          key={size}
          className="flex w-40 flex-col items-start gap-x3 rounded-lg border border-line-tertiary bg-bg-secondary p-x4"
        >
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {size}px
          </h3>
          <Checkbox size={size}>Unchecked</Checkbox>
          <Checkbox size={size} checked>
            Checked
          </Checkbox>
          <Checkbox size={size} disabled>
            Disabled
          </Checkbox>
          <Checkbox size={size} checked disabled>
            Disabled
          </Checkbox>
        </section>
      ))}
    </div>
  ),
}

function PlaygroundDemo() {
  const [checked, setChecked] = useState(false)
  return (
    <Checkbox checked={checked} onChange={setChecked}>
      이메일 저장
    </Checkbox>
  )
}

/** 클릭(라벨 포함)으로 토글하는 실사용 시나리오 */
export const Playground: Story = {
  render: () => <PlaygroundDemo />,
}
