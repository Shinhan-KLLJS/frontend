import {
  ScrollHero,
  Section2,
  Section3,
  Section4,
  Section5,
  Section6,
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="bg-bg-primary">
      {/* QHD 이상(1920px+)에서 콘텐츠 폭이 무한정 늘어나며 레이아웃이 깨지는 걸
          막기 위해 1920px에서 폭을 고정하고, 그 이상은 좌우 여백만 늘어나게 한다. */}
      <div className="mx-auto max-w-[1920px]">
        <ScrollHero />
        <Section2 />
        <div className="h-[200px] w-full rounded-b-[40px] bg-[var(--blue-400)]" />
        <Section3 />
        <Section4 />
        <Section6 />
        <Section5 />
        {/* 이후 섹션은 여기 순차 추가 */}
      </div>
    </div>
  )
}
