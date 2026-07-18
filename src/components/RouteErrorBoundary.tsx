import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui'

/**
 * 라우트 렌더 중 발생한 예외를 잡는 폴백 화면.
 * errorElement로 연결하면 해당 라우트 하위의 예외가 React Router 기본
 * 에러 화면("Unexpected Application Error!")으로 앱 전체를 덮는 대신
 * 이 화면으로 격리된다. (레이아웃 하위에 두면 헤더·LNB는 유지)
 */
export default function RouteErrorBoundary() {
  const error = useRouteError()

  if (import.meta.env.DEV) {
    console.error('[RouteErrorBoundary]', error)
  }

  return (
    <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-x4 p-x5">
      <p className="text-body-1-normal-regular text-text-secondary">
        일시적인 오류로 화면을 표시하지 못했습니다.
      </p>
      <Button
        variant="line"
        color="secondary"
        size="medium"
        onClick={() => window.location.reload()}
      >
        새로고침
      </Button>
    </div>
  )
}
