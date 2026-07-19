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
  /** 컨텐츠 영역(main) 배경 — 대시보드=bg-bg-primary, 그 외=bg-bg-secondary */
  mainClassName?: string
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
  mainClassName,
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
          {/* 컨텐츠 영역 배경 — 라우트에 따라 AppLayout이 결정(대시보드=primary, 그 외=secondary) */}
          <main
            className={['min-h-0 w-full flex-1 overflow-y-auto', mainClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {/* 컨텐츠 영역: 1040~1220px + 상하좌우 패딩 x5(20). 그 안에서 각 페이지가 자체 20px로 컨텐츠 전개 */}
            <div className="mx-auto h-full min-w-[1040px] max-w-[1220px] p-x5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
