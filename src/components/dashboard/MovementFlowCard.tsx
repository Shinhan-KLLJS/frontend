import movementFlow from '@/assets/dashboard/movement-flow.svg'
import DashboardPanel from './DashboardPanel'

/** 지도 SDK 없이 제공되는 정적 이동 동선 미리보기입니다. */
export default function MovementFlowCard() {
  return (
    <DashboardPanel className="aspect-[376/348] h-auto p-0">
      <img
        src={movementFlow}
        alt="서울 도심 지도 위에 출발점, 도착점과 캠페인 시청자 이동 경로가 표시된 정적 미리보기"
        className="h-full w-full object-cover"
      />
    </DashboardPanel>
  )
}
