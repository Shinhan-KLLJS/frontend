import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown } from 'lucide-react'
import DropdownMenu from '@/components/ui/DropdownMenu'
import Icon from '@/components/ui/Icon'
import type { DropdownMenuItem } from '@/components/ui/DropdownMenu'

const BASE_ITEMS: DropdownMenuItem[] = [
  { key: 'mypage', label: '마이 페이지' },
  { key: 'settings', label: '설정' },
  { key: 'support', label: '고객센터' },
  { key: 'logout', label: '로그아웃' },
]

const MANY_ITEMS: DropdownMenuItem[] = Array.from({ length: 12 }, (_, i) => ({
  key: `item-${i}`,
  label: `메뉴 항목 ${i + 1}`,
}))

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof DropdownMenu>

const trigger = (open: boolean) => (
  <span className="inline-flex items-center gap-x1 rounded-x2 border border-line-secondary px-x3 py-x2 text-label-1-normal-medium text-text-primary">
    메뉴
    <Icon
      icon={ChevronDown}
      size="small"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    />
  </span>
)

/** 기본 — 항목 4개 (마이 페이지·설정·고객센터·로그아웃) */
export const Default: Story = {
  render: () => (
    <div className="flex min-h-[360px] items-start">
      <DropdownMenu
        items={BASE_ITEMS}
        renderTrigger={trigger}
        align="start"
        menuAriaLabel="예시 메뉴"
      />
    </div>
  ),
}

/** 8개 초과 — 최대 8개만 보이고 소형 스크롤(ScrollArea small) */
export const Scrollable: Story = {
  render: () => (
    <div className="flex min-h-[420px] items-start">
      <DropdownMenu
        items={MANY_ITEMS}
        renderTrigger={trigger}
        align="start"
        menuAriaLabel="스크롤 메뉴"
      />
    </div>
  ),
}
