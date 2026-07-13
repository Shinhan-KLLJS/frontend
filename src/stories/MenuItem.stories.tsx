import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { House, Megaphone, Users, Calendar } from 'lucide-react'
import MenuItem from '@/components/ui/MenuItem'

// MenuItem — 사이드바 LNB 메뉴 아이템
const meta: Meta<typeof MenuItem> = {
  title: 'Components/MenuItem',
  component: MenuItem,
  parameters: { layout: 'padded' },
  argTypes: {
    selected: { control: 'boolean' },
    short: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof MenuItem>

export const Default: Story = {
  args: {
    children: 'Menu Name',
    icon: House,
    selected: false,
    short: false,
    disabled: false,
  },
  render: (args) => (
    <div className="w-[240px]">
      <MenuItem {...args} />
    </div>
  ),
}

/**
 * 매트릭스 : State(default/hover/pres//select) × Fill(default/short)
 */
export const Matrix: Story = {
  render: () => {
    const rows: Array<{
      state: string
      note?: string
      props?: { selected?: boolean; disabled?: boolean }
      forcedClass?: string
    }> = [
      { state: 'default' },
      {
        state: 'hover',
        note: '정적 프리뷰 (실제로는 :hover)',
        forcedClass: 'bg-primary-brand-weak! text-primary-brand-solid-hover!',
      },
      {
        state: 'press',
        note: '정적 프리뷰 (실제로는 :active)',
        forcedClass: 'bg-[var(--blue-100)]! text-primary-brand-solid-pressed!',
      },
      { state: 'select', props: { selected: true } },
      { state: 'disabled', props: { disabled: true } },
    ]
    return (
      <div className="font-sans flex flex-col gap-3">
        {rows.map(({ state, note, props, forcedClass }) => (
          <div key={state} className="flex items-center gap-6">
            <span className="w-[160px] text-label-1-normal-bold text-text-secondary">
              {state}
              {note && (
                <span className="block text-caption-2-regular text-text-caption">
                  {note}
                </span>
              )}
            </span>
            <div className="w-[224px]">
              <MenuItem icon={House} className={forcedClass} {...props}>
                Menu Name
              </MenuItem>
            </div>
            <MenuItem
              icon={House}
              short
              aria-label="Menu Name"
              className={forcedClass}
              {...props}
            />
          </div>
        ))}
      </div>
    )
  },
}

/** Fill=short — 사이드바 접힘 상태. 라벨은 숨기고 aria-label 유지 */
export const Short: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <MenuItem icon={House} short aria-label="홈" />
      <MenuItem icon={Megaphone} short selected aria-label="캠페인" />
      <MenuItem icon={Users} short disabled aria-label="회원 관리" />
    </div>
  ),
}

const SIDEBAR_MENUS = [
  { icon: House, label: '홈' },
  { icon: Megaphone, label: '캠페인 관리' },
  { icon: Users, label: '회원 관리' },
  { icon: Calendar, label: '일정 관리' },
]

function SidebarDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  return (
    <div className="flex items-start gap-8">
      {/* 펼침 (Fill=default, 240px) */}
      <nav
        aria-label="펼친 사이드바 예시"
        className="flex w-[240px] flex-col gap-x2 rounded-x3 bg-bg-secondary px-x2 py-x1 shadow-normal-small"
      >
        {SIDEBAR_MENUS.map(({ icon, label }, index) => (
          <MenuItem
            key={label}
            icon={icon}
            selected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          >
            {label}
          </MenuItem>
        ))}
        <MenuItem icon={Calendar} disabled>
          비활성 메뉴
        </MenuItem>
      </nav>
      {/* 접힘 (Fill=short, 60px) */}
      <nav
        aria-label="접힌 사이드바 예시"
        className="flex w-[60px] flex-col items-center gap-x2 rounded-x3 bg-bg-secondary px-x2 py-x1 shadow-normal-small"
      >
        {SIDEBAR_MENUS.map(({ icon, label }, index) => (
          <MenuItem
            key={label}
            icon={icon}
            short
            aria-label={label}
            selected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
        <MenuItem icon={Calendar} short disabled aria-label="비활성 메뉴" />
      </nav>
    </div>
  )
}

/** 사이드바 조합 예시 — 클릭으로 선택 이동, 펼침/접힘 동기화 */
export const SidebarExample: Story = {
  render: () => <SidebarDemo />,
}
