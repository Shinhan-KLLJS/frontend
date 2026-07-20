import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export interface MainOverlayProps {
  children: ReactNode
}

/**
 * LNB·헤더를 제외한 main 콘텐츠 영역만 Dimer_Black 딤머로 덮고 자식을 중앙 정렬한다.
 * - 앱 셸: #app-content-area(헤더+본문, LNB 제외)에 포털해 헤더(56px) 아래 본문만 덮는다.
 * - 온보딩: #onboarding-main(헤더 아래 본문)에 포털해 그 영역을 덮는다.
 * - 둘 다 없으면 뷰포트 전체(fallback).
 */
export default function MainOverlay({ children }: MainOverlayProps) {
  const appContent = document.getElementById('app-content-area')
  const onboardingMain = document.getElementById('onboarding-main')

  let target: HTMLElement
  let boxClass: string
  if (appContent) {
    target = appContent
    // 헤더(56px)를 제외한 본문 영역만 덮는다
    boxClass = 'absolute inset-x-0 bottom-0 top-[56px]'
  } else if (onboardingMain) {
    target = onboardingMain
    boxClass = 'absolute inset-0'
  } else {
    target = document.body
    boxClass = 'fixed inset-0'
  }

  return createPortal(
    <div
      className={`${boxClass} z-50 flex items-center justify-center bg-[var(--Dimer_Black)]`}
    >
      {children}
    </div>,
    target,
  )
}
