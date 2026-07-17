import type { ReactNode } from 'react'
import { Header, LNB } from '@/components/ui'
import type { LNBMenu, DropdownMenuItem } from '@/components/ui'

export interface AppShellProps {
  menus: LNBMenu[]
  selectedKey: string
  onSelect: (key: string) => void
  login?: boolean
  avatarSrc?: string
  onServiceIntroClick?: () => void
  onSignUpClick?: () => void
  onLoginClick?: () => void
  profileMenu?: DropdownMenuItem[]
  children: ReactNode
}

/**
 * 앱 셸 — 인증/라우터 의존 없이 LNB(좌) + Header(상) + 본문 레이아웃만 담당.
 */
export default function AppShell({
  menus,
  selectedKey,
  onSelect,
  login,
  avatarSrc,
  onServiceIntroClick,
  onSignUpClick,
  onLoginClick,
  profileMenu,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-full justify-center overflow-x-auto bg-bg-primary">
      <div className="flex h-full w-full ">
        <LNB
          menus={menus}
          selectedKey={selectedKey}
          onSelect={onSelect}
          className="shrink-0"
        />
        <div
          id="app-content-area"
          className="relative flex w-full flex-1 flex-col"
        >
          <Header
            login={login}
            avatarSrc={avatarSrc}
            onServiceIntroClick={onServiceIntroClick}
            onSignUpClick={onSignUpClick}
            onLoginClick={onLoginClick}
            profileMenu={profileMenu}
          />
          <main className="min-h-0 flex-1 overflow-y-auto w-full">
            <div className="mx-auto h-full min-w-[1040px] max-w-[1440px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
