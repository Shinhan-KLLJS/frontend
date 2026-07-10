import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown } from 'lucide-react'
import Chip, { CHIP_SIZE } from '@/components/ui/Chip'

// 필터 선택형 칩
const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'select',
      options: [...CHIP_SIZE],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Chip>

export const Default: Story = {
  args: {
    children: 'Text',
    size: 'medium',
    selected: false,
    disabled: false,
    trailingIcon: ChevronDown,
  },
}

const STATUS_VARIANTS = [
  { name: 'Default', props: {} },
  { name: 'Select', props: { selected: true } },
  { name: 'Disable', props: { disabled: true } },
] as const

/** 매트릭스: Status(Default/Select/Disable) × Size(Small/Medium/Large) */
export const Matrix: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-6">
      {STATUS_VARIANTS.map(({ name, props }) => (
        <div key={name} className="flex flex-col gap-2">
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {name}
          </h3>
          <div className="flex items-center gap-3">
            {CHIP_SIZE.map((size) => (
              <Chip
                key={size}
                size={size}
                leadingIcon={ChevronDown}
                trailingIcon={ChevronDown}
                {...props}
              >
                Text
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/** 아이콘 조합: 없음 · leading · trailing · 양쪽 */
export const WithIcons: Story = {
  render: () => (
    <div className="font-sans flex items-center gap-3">
      <Chip>Text</Chip>
      <Chip leadingIcon={ChevronDown}>Text</Chip>
      <Chip trailingIcon={ChevronDown}>Text</Chip>
      <Chip leadingIcon={ChevronDown} trailingIcon={ChevronDown}>
        Text
      </Chip>
    </div>
  ),
}
