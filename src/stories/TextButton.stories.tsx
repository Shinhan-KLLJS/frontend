import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TextButton, { TEXT_BUTTON_SIZE } from '@/components/ui/TextButton'

// Text Button — Size(Large/Medium) × Disable
const meta: Meta<typeof TextButton> = {
  title: 'Components/TextButton',
  component: TextButton,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: TEXT_BUTTON_SIZE },
    disabled: { control: 'boolean' },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof TextButton>

export const Default: Story = {
  args: {
    children: 'Text',
    size: 'large',
    disabled: false,
    leadingIcon: ChevronLeft,
    trailingIcon: ChevronRight,
  },
}

/** 매트릭스 : Size(large/medium) × Disable */
export const Matrix: Story = {
  render: () => (
    <div className="font-sans flex flex-col items-start gap-3">
      {TEXT_BUTTON_SIZE.map((size) => (
        <section key={size} className="flex flex-col gap-3">
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {size}
          </h3>
          <div key={size} className="flex items-center gap-6">
            <TextButton
              size={size}
              leadingIcon={ChevronLeft}
              trailingIcon={ChevronRight}
            >
              Text
            </TextButton>
            <TextButton
              size={size}
              leadingIcon={ChevronLeft}
              trailingIcon={ChevronRight}
              disabled
            >
              Text
            </TextButton>
          </div>
        </section>
      ))}
    </div>
  ),
}

/** 아이콘 조합: 없음 · leading · trailing · 양쪽 */
export const WithIcons: Story = {
  render: () => (
    <div className="font-sans flex items-center gap-4">
      <TextButton>Text</TextButton>
      <TextButton leadingIcon={ChevronLeft}>Text</TextButton>
      <TextButton trailingIcon={ChevronRight}>Text</TextButton>
      <TextButton leadingIcon={ChevronLeft} trailingIcon={ChevronRight}>
        Text
      </TextButton>
    </div>
  ),
}
