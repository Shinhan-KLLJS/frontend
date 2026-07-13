import type { Meta, StoryObj } from '@storybook/react-vite'
import Badge, { BADGE_DIRECTION, BADGE_SIZE } from '@/components/ui/Badge'

// KPI 등락 배지
const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'select',
      options: [...BADGE_SIZE],
    },
    direction: {
      control: 'select',
      options: [...BADGE_DIRECTION],
    },
  },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: '15',
    direction: 'up',
    size: 'medium',
  },
}

/** 매트릭스: Size(Small/Medium/Large) × Property(Up/Down) */
export const Matrix: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-6">
      {BADGE_DIRECTION.map((direction) => (
        <div key={direction} className="flex flex-col gap-2">
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {direction === 'up' ? 'Up' : 'Down'}
          </h3>
          <div className="flex items-center gap-3">
            {BADGE_SIZE.map((size) => (
              <Badge key={size} direction={direction} size={size}>
                15
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}
