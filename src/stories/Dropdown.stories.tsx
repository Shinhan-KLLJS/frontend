import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Dropdown, {
  DROPDOWN_SIZE,
  type DropdownOption,
  type DropdownSize,
} from '@/components/ui/Dropdown'

const OPTIONS: DropdownOption[] = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'incheon', label: '인천' },
  { value: 'daegu', label: '대구' },
  { value: 'gwangju', label: '광주' },
]

const MENU_OPTIONS: DropdownOption[] = Array.from({ length: 10 }, (_, i) => ({
  value: `menu-${i + 1}`,
  label: 'Menu 1',
}))

// Dropdown
const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'select', options: DROPDOWN_SIZE },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    maxListHeight: { control: 'number' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Dropdown>

/* ── 매트릭스 : 옵션 행 상태 ── */
const ROW_TEXT: Record<DropdownSize, string> = {
  large: 'text-heading-2-regular',
  medium: 'text-label-1-normal-regular',
}

function RowPreview({
  size,
  overlayOpacity = 0,
  disabled = false,
}: {
  size: DropdownSize
  overlayOpacity?: number
  disabled?: boolean
}) {
  return (
    <div
      className={`relative w-[280px] rounded-x2 p-x2 ${ROW_TEXT[size]} ${
        disabled ? 'text-text-disabled' : 'text-text-secondary'
      }`}
    >
      <span className="block truncate">Text</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-x2 bg-[var(--cool-neutral-1000)]"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}

/** State(Default/Hover/Press/Disable) × Size(Large/Medium) 한눈에 보기 */
export const ItemStates: Story = {
  render: () => (
    <div className="font-sans flex gap-10">
      {DROPDOWN_SIZE.map((size) => (
        <div key={size} className="flex flex-col gap-3">
          <h2 className="text-label-1-normal-bold">
            {size} ({size === 'large' ? '44px · Heading2' : '36px · Label1'})
          </h2>
          {(
            [
              ['Default', 0, false],
              ['Hover (5%)', 0.05, false],
              ['Press (12%)', 0.12, false],
              ['Disable', 0, true],
            ] as const
          ).map(([label, opacity, disabled]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-[88px] text-caption-1-regular text-text-caption">
                {label}
              </span>
              <RowPreview
                size={size}
                overlayOpacity={opacity}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}

/* ── 열린 리스트 ── */
export const OpenList: Story = {
  render: () => (
    <div className="font-sans flex gap-16 pb-[340px]">
      <div className="w-[160px]">
        <Dropdown
          size="medium"
          options={MENU_OPTIONS}
          placeholder="Menu"
          maxListHeight={290}
          defaultOpen
        />
      </div>
      <div className="w-[428px]">
        <Dropdown
          size="large"
          options={OPTIONS}
          placeholder="지역을 선택하세요"
          defaultOpen
        />
      </div>
    </div>
  ),
}

/* ──실제 열고 닫기 ── */
const PlaygroundExample = (args: Parameters<typeof Dropdown>[0]) => {
  const [value, setValue] = useState<string | undefined>(undefined)
  return (
    <div className="font-sans w-[428px] pb-[300px]">
      <p className="mb-3 text-caption-1-regular text-text-caption">
        클릭해서 열고 닫기 · ↑↓/Enter/Escape 키보드 탐색 · 외부 클릭 시 닫힘
      </p>
      <Dropdown {...args} value={value ?? ''} onChange={setValue} />
      <p className="mt-3 text-caption-1-regular text-text-caption">
        선택된 값: {value ?? '(없음)'}
      </p>
    </div>
  )
}

/** 인터랙티브 데모 — 컨트롤에서 size/disabled 조절 가능 */
export const Default: Story = {
  args: {
    options: OPTIONS,
    placeholder: '지역을 선택하세요',
    size: 'large',
    disabled: false,
  },
  render: (args) => <PlaygroundExample {...args} />,
}

/** 트리거·옵션 비활성 */
export const Disabled: Story = {
  render: () => (
    <div className="font-sans flex w-[428px] flex-col gap-4 pb-[260px]">
      <Dropdown options={OPTIONS} placeholder="비활성 트리거" disabled />
      <Dropdown
        options={[
          { value: 'a', label: '선택 가능' },
          { value: 'b', label: '선택 불가', disabled: true },
          { value: 'c', label: '선택 가능' },
        ]}
        placeholder="옵션 일부 비활성"
        defaultOpen
      />
    </div>
  ),
}
