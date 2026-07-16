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
      <ScrollHero />
      <Section2 />
      <div className="h-[200px] w-full rounded-b-[40px] bg-[#3a83f5]" />
      <Section3 />
      <Section4 />
      <Section6 />
      <Section5 />
      {/* 이후 섹션은 여기 순차 추가 */}
    </div>
  )
}
