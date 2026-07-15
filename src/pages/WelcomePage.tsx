import { useNavigate } from 'react-router-dom'
import teamCreateImage from '@/assets/onboarding/team-create.png'
import teamJoinImage from '@/assets/onboarding/team-join.png'
import PlanCard from '@/components/team/PlanCard'

/**
 * 팀 생성/합류 분기점 (Choose Plan) — 팀이 없는 유저의 온보딩 첫 화면
 */
export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-x2 p-x5 text-center">
        <h1 className="text-title-1-bold text-text-primary">
          <span className="text-text-brand">Loovi</span>에 오신 것을 환영합니다
        </h1>
        <p className="text-body-1-normal-regular text-text-primary">
          현재 계정에 소속된 팀이 없습니다.
          <br />
          팀에 합류하거나 새 팀을 만들어 옥외광고 성과를 확인하고 분석하세요.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x5 p-x5">
        <PlanCard
          image={teamCreateImage}
          title="새 팀을 만들고 싶다면?"
          description={[
            '소속 회사의 팀을 만들고 팀원을 초대해',
            '옥외광고 성과를 분석하세요.',
          ]}
          buttonLabel="팀 생성하기"
          onSelect={() => navigate('/welcome/create')}
        />
        <PlanCard
          image={teamJoinImage}
          title="소속 팀에서 이미 Loovi를 사용 중이라면?"
          description={[
            '팀에 합류해 팀원과 함께',
            '옥외광고 효과를 분석하세요.',
          ]}
          buttonLabel="팀 합류하기"
          onSelect={() => navigate('/welcome/join')}
        />
      </div>
    </section>
  )
}
