import { useNavigate } from 'react-router-dom'
import teamCreateImage from '@/assets/onboarding/team-create.png'
import teamJoinImage from '@/assets/onboarding/team-join.png'
import { Button } from '@/components/ui'

const CARD_SHADOW =
  'shadow-[0px_10px_15px_-5px_rgba(23,23,23,0.1),0px_24px_38px_-10px_rgba(23,23,23,0.12)]'

interface PlanCardProps {
  image: string
  title: string
  description: [string, string]
  buttonLabel: string
  onSelect: () => void
}

/** 분기 카드 — 상단 일러스트 + 하단 설명/CTA (피그마 388x400 스펙) */
function PlanCard({
  image,
  title,
  description,
  buttonLabel,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex h-[400px] w-[388px] items-end overflow-hidden rounded-x4 bg-bg-secondary p-x5 ${CARD_SHADOW}`}
    >
      <img
        alt=""
        src={image}
        className="absolute inset-x-0 top-0 h-[260px] w-full object-cover"
      />
      <div className="relative flex w-full flex-col items-center gap-x5">
        <div className="flex flex-col items-center gap-x2 text-center">
          <h2 className="text-headline-2-bold text-text-primary">{title}</h2>
          <p className="text-label-1-normal-regular text-text-secondary">
            {description[0]}
            <br />
            {description[1]}
          </p>
        </div>
        <Button size="large" className="w-full" onClick={onSelect}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  )
}

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
          현재 고객님 계정으로 소속된 팀이 없습니다.
          <br />
          팀에 합류하거나 새롭게 팀을 생성해 옥외 광고 성과를 논리적으로 확인해
          보세요
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x5 p-x5">
        <PlanCard
          image={teamCreateImage}
          title="팀에 Loovi를 도입하고 싶다면"
          description={[
            '내 소속 회사의 팀을 생성하고 팀원들을 초대해',
            '효과적인 옥외 광고 성과를 분석해 보세요',
          ]}
          buttonLabel="팀 생성하기"
          onSelect={() => navigate('/welcome/create')}
        />
        <PlanCard
          image={teamJoinImage}
          title="팀에서 이미 사용 중이라면?"
          description={[
            '팀에 합류해 팀원들과 함께',
            '옥외 광고 효과를 분석할 수 있어요',
          ]}
          buttonLabel="팀 합류하기"
          onSelect={() => navigate('/welcome/join')}
        />
      </div>
    </section>
  )
}
