import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, ChevronRight, Settings } from 'lucide-react'
import Button, {
  BUTTON_VARIANT,
  BUTTON_COLOR,
  BUTTON_SIZE,
  type ButtonColor,
  type ButtonVariant,
} from '@/components/ui/Button'

// Button
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: BUTTON_VARIANT },
    color: { control: 'select', options: BUTTON_COLOR },
    size: { control: 'select', options: BUTTON_SIZE },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Label',
    variant: 'default',
    color: 'primary',
    size: 'large',
    iconOnly: false,
    disabled: false,
    leadingIcon: Plus,
    trailingIcon: ChevronRight,
  },
}

const COMBOS: Array<{ variant: ButtonVariant; color: ButtonColor }> = [
  { variant: 'default', color: 'primary' },
  { variant: 'default', color: 'secondary' },
  { variant: 'line', color: 'primary' },
  { variant: 'line', color: 'secondary' },
]

/** 매트릭스: Variant(default/line) × Color(primary/secondary) × Size(large/medium/small) */
export const Matrix: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-8">
      {BUTTON_SIZE.map((size) => (
        <section key={size} className="flex flex-col gap-3">
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {size}
          </h3>
          <div className="grid w-fit grid-cols-4 items-center gap-x-6 gap-y-3">
            {COMBOS.map(({ variant, color }) => (
              <Button
                key={`${variant}-${color}`}
                variant={variant}
                color={color}
                size={size}
                leadingIcon={Plus}
                trailingIcon={ChevronRight}
              >
                Label
              </Button>
            ))}
            {COMBOS.map(({ variant, color }) => (
              <Button
                key={`${variant}-${color}-disabled`}
                variant={variant}
                color={color}
                size={size}
                leadingIcon={Plus}
                trailingIcon={ChevronRight}
                disabled
              >
                Label
              </Button>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
}

/** 사이즈 프리셋: large 48 · medium 40 · small 32 */
export const Sizes: Story = {
  render: () => (
    <div className="font-sans flex items-end gap-4">
      {BUTTON_SIZE.map((size) => (
        <Button key={size} size={size} leadingIcon={Plus}>
          Label
        </Button>
      ))}
    </div>
  ),
}

/** 아이콘 조합: 없음 · leading · trailing · 양쪽 */
export const WithIcons: Story = {
  render: () => (
    <div className="font-sans flex items-center gap-4">
      <Button>Label</Button>
      <Button leadingIcon={Plus}>Label</Button>
      <Button trailingIcon={ChevronRight}>Label</Button>
      <Button leadingIcon={Plus} trailingIcon={ChevronRight}>
        Label
      </Button>
    </div>
  ),
}

/** Icon Only — 정사각 버튼, 아이콘 24/20/16. aria-label 필수 */
export const IconOnly: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-4">
      {BUTTON_SIZE.map((size) => (
        <div key={size} className="flex items-center gap-4">
          {COMBOS.map(({ variant, color }) => (
            <Button
              key={`${variant}-${color}`}
              variant={variant}
              color={color}
              size={size}
              iconOnly
              leadingIcon={Settings}
              aria-label="설정"
            />
          ))}
          {COMBOS.map(({ variant, color }) => (
            <Button
              key={`${variant}-${color}-disabled`}
              variant={variant}
              color={color}
              size={size}
              iconOnly
              leadingIcon={Settings}
              aria-label="설정"
              disabled
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Disabled — Default는 bg/disabled, Line은 텍스트만 비활성 색 */
export const Disabled: Story = {
  render: () => (
    <div className="font-sans flex items-center gap-4">
      {COMBOS.map(({ variant, color }) => (
        <Button
          key={`${variant}-${color}`}
          variant={variant}
          color={color}
          leadingIcon={Plus}
          trailingIcon={ChevronRight}
          disabled
        >
          Label
        </Button>
      ))}
    </div>
  ),
}
