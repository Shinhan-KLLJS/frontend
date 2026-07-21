import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export interface MainOverlayProps {
  children: ReactNode
}

/**
 * LNB를 제외한 영역(헤더+본문)을 Dimer_Black 딤머로 덮고 자식을 중앙 정렬한다.
 * - 앱 셸: #app-content-area(헤더+본문, LNB 제외)에 포털해 그 영역 전체를 덮는다.
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
    // LNB만 제외하고 헤더 포함 전체를 덮는다(다른 모달 딤머와 동일 범위)
    boxClass = 'absolute inset-0'
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
