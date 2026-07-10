import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import LNB from '@/components/ui/LNB'

// LNB — 왼쪽 사이드바 (side_header + MenuItem 리스트)
const meta: Meta<typeof LNB> = {
  title: 'Components/LNB',
  component: LNB,
  parameters: { layout: 'padded' },
  argTypes: {
    short: { control: 'boolean' },
    selectedKey: {
      control: 'select',
      options: ['home', 'campaign', 'team', 'calendar'],
    },
  },
}
export default meta

type Story = StoryObj<typeof LNB>

/** State(Normal 240 / Short 60) */
export const Variants: Story = {
  render: () => (
    <div className="flex h-[722px] items-start gap-8 bg-bg-primary p-x4">
      <LNB short={false} selectedKey="home" aria-label="펼친 사이드바" />
      <LNB short selectedKey="home" aria-label="접힌 사이드바" />
    </div>
  ),
}

function InteractiveDemo() {
  const [short, setShort] = useState(false)
  const [selectedKey, setSelectedKey] = useState('home')
  return (
    <div className="h-[722px] bg-bg-primary p-x4">
      <LNB
        short={short}
        onShortChange={setShort}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
    </div>
  )
}

/**
 * 인터랙티브 — 토글 hover 시 아이콘 스왑(PanelLeft→PanelLeftClose, 접힘 로고→PanelLeftOpen), 클릭으로 접기/펼치기·메뉴 선택
 */
export const Default: Story = {
  render: () => <InteractiveDemo />,
}

function AppShellDemo() {
  const [short, setShort] = useState(false)
  const [selectedKey, setSelectedKey] = useState('home')
  return (
    <div className="flex h-screen bg-bg-primary">
      <LNB
        short={short}
        onShortChange={setShort}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[56px] shrink-0 items-center border-b border-line-tertiary bg-bg-secondary px-x10">
          <span className="text-body-1-normal-bold text-text-primary">
            Header (56 + 1px)
          </span>
        </header>
        <main
          data-testid="scroll-content"
          className="min-h-0 flex-1 overflow-y-auto px-x10 py-x5"
        >
          <div className="mx-auto flex max-w-content-lg flex-col gap-x5">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="rounded-x3 border border-line-tertiary bg-bg-secondary p-x6 text-body-2-normal-regular text-text-secondary"
              >
                콘텐츠 블록 {i + 1} — 콘텐츠 영역만 스크롤되고 LNB·헤더는
                고정됩니다.
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * 앱 레이아웃 검증 — Side 240(고정) + Header 56(고정) + Content(스크롤).
 */
export const AppShell: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <AppShellDemo />,
}
