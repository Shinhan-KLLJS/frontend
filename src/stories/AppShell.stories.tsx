import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import AppShell from '@/components/layout/AppShell'
import { LNB_DEFAULT_MENUS } from '@/components/ui'

// 디자인 시스템 LNB 기본 메뉴로 데모
const MENUS = LNB_DEFAULT_MENUS

const MENU_LABEL: Record<string, string> = Object.fromEntries(
  MENUS.map((m) => [m.key, m.label]),
)

// 본문 영역 확인용 placeholder — 실제로는 <Outlet/>의 각 페이지가 들어간다
function MockContent({ selectedKey }: { selectedKey: string }) {
  return (
    <div className="flex flex-col gap-x5 p-x5">
      <h1 className="text-title-3-bold text-text-primary">
        {MENU_LABEL[selectedKey] ?? '홈'} 콘텐츠 영역
      </h1>
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="rounded-x3 border border-line-tertiary bg-bg-secondary p-x6 text-body-2-normal-regular text-text-secondary"
        >
          콘텐츠 블록 {i + 1} — LNB·헤더는 고정되고 이 영역만 스크롤됩니다.
        </div>
      ))}
    </div>
  )
}

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    login: { control: 'boolean' },
    avatarSrc: { control: 'text' },
    menus: { table: { disable: true } },
    selectedKey: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    children: { table: { disable: true } },
  },
}
export default meta

type Story = StoryObj<typeof AppShell>

// LNB 접기/펴기 · 메뉴 선택 하이라이트 · 헤더 로그인 상태 · 본문 스크롤을 한 번에 확인
function Interactive({
  login,
  avatarSrc,
}: {
  login: boolean
  avatarSrc?: string
}) {
  const [selectedKey, setSelectedKey] = useState('home')
  return (
    <AppShell
      menus={MENUS}
      selectedKey={selectedKey}
      onSelect={setSelectedKey}
      login={login}
      avatarSrc={avatarSrc}
      profileMenu={[
        { key: 'mypage', label: '마이 페이지' },
        { key: 'settings', label: '설정' },
        { key: 'support', label: '고객센터' },
        { key: 'logout', label: '로그아웃' },
      ]}
    >
      <MockContent selectedKey={selectedKey} />
    </AppShell>
  )
}

// 로그인 상태 — 헤더에 알림·아바타. LNB 로고 옆 토글로 접기/펴기, 메뉴 클릭 시 선택 하이라이트.
export const LoggedIn: Story = {
  args: { login: true },
  render: (args) => (
    <Interactive login={!!args.login} avatarSrc={args.avatarSrc} />
  ),
}

// 비로그인 상태 — 헤더에 회원가입/로그인 버튼.
export const LoggedOut: Story = {
  args: { login: false },
  render: (args) => (
    <Interactive login={!!args.login} avatarSrc={args.avatarSrc} />
  ),
}
