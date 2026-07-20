import { useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import { Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useMediaQuery } from '@/lib/useMediaQuery'
import teamChoiceBgVideo from '@/assets/landing/Teamchoicebg.mp4'
import generateTeamFieldImage from '@/assets/landing/Generate-Team-Field.png'
import teamCodeFillImage from '@/assets/landing/Team-Code-Fill.png'

type CardKey = 'generate' | 'join'

const CARDS: {
  key: CardKey
  title: string
  body: string
  image: string
  bullets: string[]
  buttonLabel: string
}[] = [
  {
    key: 'generate',
    title: '새로운 팀을 만들어 시작하세요',
    body: '팀을 만들고 함께 캠페인을 관리해 보세요.',
    image: generateTeamFieldImage,
    bullets: [
      '팀원을 초대해 함께 협업할 수 있어요.',
      '광고 캠페인을 등록하고 운영할 수 있어요.',
      '팀 전체의 광고 성과를 한눈에 모아볼 수 있어요.',
    ],
    buttonLabel: '팀 생성하러 가기',
  },
  {
    key: 'join',
    title: '초대받은 팀에 참여하세요',
    body: '팀 코드를 입력해 팀에 바로 합류할 수 있어요.',
    image: teamCodeFillImage,
    bullets: [
      '초대 코드로 간편하게 팀에 합류할 수 있어요.',
      '진행중인 캠페인과 광고 성과를 확인할 수 있어요.',
      '팀원들과 소통하며 광고 성과를 분석할 수 있어요.',
    ],
    buttonLabel: '팀 합류하러 가기',
  },
]

// 카드 중심에서 바깥으로 퍼지는 파티클 배치값 — 각도는 균등 분산, 거리·크기·
// 딜레이·지속시간은 인덱스 기반으로 결정해 매 렌더마다 값이 바뀌지 않게
// (재현 가능하게) 한다.
const PARTICLE_COUNT = 60
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2
  // 카드(488×572)의 반너비(244)·반높이(286)를 확실히 넘어서야 카드 뒤에서
  // 나와 바깥 레이아웃까지 보인다.
  const distance = 260 + ((i * 13) % 160)
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance,
    size: 4 + ((i * 7) % 10),
    delay: (i * 0.37) % 2.4,
    duration: 1.4 + ((i * 0.53) % 1.2),
  }
})

/**
 * 두 카드 중 하나를 호버하면 호버된 카드는 1.05배 커지고, 반대 카드는
 * 0.95배 작아지며 블러 처리된다 — hovered/otherHovered는 부모(TeamCards)가
 * 공유 상태로 관리해서 넘겨준다. 모바일/태블릿에서는 항상 둘 다 false.
 */
function TeamCard({
  card,
  hovered,
  otherHovered,
  onHoverChange,
  className = '',
}: {
  card: (typeof CARDS)[number]
  hovered: boolean
  otherHovered: boolean
  onHoverChange?: (hovered: boolean) => void
  className?: string
}) {
  const stateClass = hovered
    ? 'scale-[1.05]'
    : otherHovered
      ? 'scale-[0.95] blur-[2px]'
      : 'scale-100'

  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`relative transition-all duration-300 ease-out ${stateClass} ${className}`}
    >
      {/* 카드 뒤(z-order상 아래)에서 발생해, 카드 바깥으로 나온 부분만 보인다 */}
      {hovered && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          {PARTICLES.map((particle, i) => (
            <span
              key={i}
              className="particle-burst absolute left-1/2 top-1/2 rounded-full bg-primary-brand-solid blur-[1px]"
              style={
                {
                  width: particle.size,
                  height: particle.size,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                  '--particle-dx': `${particle.dx}px`,
                  '--particle-dy': `${particle.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div
        className={`relative flex flex-col items-center gap-x6 rounded-[20px] border bg-bg-secondary px-x5 py-x6 shadow-normal-large transition-colors duration-300 ${hovered ? 'border-primary-brand-solid' : 'border-line-tertiary'}`}
      >
        <div className="flex w-full flex-col items-center gap-x5">
          <div className="flex w-full flex-col items-start gap-x1">
            <h3 className="w-full text-headline-1-bold text-text-primary md:text-heading-2-bold">
              {card.title}
            </h3>
            <p className="w-full text-body-1-normal-regular text-text-tertiary md:text-headline-2-regular">
              {card.body}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-x5">
            <div className="h-[260px] w-full rounded-[16px] bg-[var(--blue-100)] p-x6">
              <img
                src={card.image}
                alt=""
                className="size-full rounded-[8px] object-cover"
              />
            </div>

            <div className="flex w-full flex-col items-start gap-x3">
              {card.bullets.map((bullet) => (
                <div key={bullet} className="flex w-full items-center gap-x2">
                  <Icon icon={Check} size="medium" color="primary" />
                  <p className="text-label-1-normal-regular text-text-primary">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="default"
          color="primary"
          className="w-full bg-[var(--cool-neutral-900)]!"
        >
          {card.buttonLabel}
        </Button>
      </div>
    </div>
  )
}

function TeamCards({
  hoverable,
  className = '',
  cardClassName = '',
}: {
  hoverable: boolean
  className?: string
  cardClassName?: string
}) {
  const [hoveredCard, setHoveredCard] = useState<CardKey | null>(null)

  return (
    <div className={className}>
      {CARDS.map((card) => (
        <TeamCard
          key={card.key}
          card={card}
          hovered={hoverable && hoveredCard === card.key}
          otherHovered={
            hoverable && hoveredCard !== null && hoveredCard !== card.key
          }
          onHoverChange={
            hoverable
              ? (isHovered) => setHoveredCard(isHovered ? card.key : null)
              : undefined
          }
          className={cardClassName}
        />
      ))}
    </div>
  )
}

const TITLE = (
  <>
    원하는 방법으로
    <br className="hidden md:block" /> 팀원들과 함께
    <br className="md:hidden" /> Loovi를 사용해 보세요
  </>
)

/** 데스크탑(lg 이상): 488px 고정폭 카드 2개를 가로로 배치, 화면이 넓어져도 폭 고정. */
function DesktopSection5() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Section5는 페이지 최하단 섹션이라 뒤에 스크롤할 콘텐츠가 없다 — offset의
  // 두 번째 지점을 'start start'(섹션 상단이 뷰포트 상단에 닿음)로 두면, 섹션
  // 자체 높이가 뷰포트 높이보다 짧을 때(=거의 모든 데스크탑 화면) 그 지점에
  // 도달하기 전에 문서 끝(최대 스크롤)에 먼저 도달해버려 progress가 1에 영영
  // 도달하지 못하고 카드가 항상 반투명한 채로 멈춰 있었다(스크롤 애니메이션
  // 프리즈가 아니라 애초에 도달 불가능한 임계값이 원인). 'end end'(섹션
  // 하단이 뷰포트 하단에 닿음)는 마지막 섹션에서도 최대 스크롤 시점에 항상
  // 정확히 도달하므로 이 문제가 없다.
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.4, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.4, 1], [40, 0])

  // style={{opacity: motionValue}} 반응형 바인딩이 이 코드베이스에서 간헐적으로
  // 멈춰(원인 불명, ScrollHero·Section2·Section4에서도 겪음) 카드가 중간 값에
  // 고정된 채 반투명하게 굳어버리는 문제가 있어 ref로 직접 opacity를 써서 우회한다.
  useMotionValueEvent(entranceOpacity, 'change', (v) => {
    if (videoRef.current) videoRef.current.style.opacity = String(v)
    if (contentRef.current) contentRef.current.style.opacity = String(v)
  })

  return (
    <section
      ref={sectionRef}
      className="relative mt-x10 overflow-hidden px-x10 pb-[100px] pt-x10"
    >
      {/* 좌상단(top-0 left-0)에 고정한 채 140% 크기로 깔아서, 초과분 40%가
          전부 우측·하단으로만 넘치게 한다 — 중앙정렬(대칭 크롭)이면 섹션
          가로세로 비율이 바뀔 때마다 크롭 지점이 움직여서 우측 하단의 AI
          워터마크가 화면 안으로 들어올 수 있는데, 좌상단 고정은 비율이
          바뀌어도 우측 하단이 항상 컨테이너 밖으로 밀려나 있어 안전하다. */}
      <motion.video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src={teamChoiceBgVideo}
        className="absolute left-0 top-0 h-[140%] w-[140%] object-cover"
        style={{ opacity: entranceOpacity.get() }}
      />

      <motion.div
        ref={contentRef}
        className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-x10"
        style={{ opacity: entranceOpacity.get(), y: entranceY }}
      >
        <h2 className="text-center text-display-3-medium text-text-primary">
          {TITLE}
        </h2>

        <TeamCards
          hoverable
          className="flex items-start justify-center gap-x10"
          cardClassName="w-[488px] shrink-0"
        />
      </motion.div>
    </section>
  )
}

/** lg 미만(태블릿·모바일): 세로 스택, 카드 폭은 화면에 맞게 유동적(최대 488px). */
function StaticSection5() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  // 화면 폭이 아니라 실제 호버 가능 여부(마우스·트랙패드)로 판단한다 —
  // 터치 전용 기기에서 onMouseEnter/Leave 기반 호버는 탭 후 상태가 안
  // 풀리는 "sticky hover" 버그가 생기기 쉬워서, hover:hover 지원 기기
  // (트랙패드 달린 태블릿 등)에서만 데스크탑과 동일한 호버 효과를 켠다.
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  // 마지막 섹션이라 'start start' 지점(섹션 상단=뷰포트 상단)에 도달하기 전에
  // 문서 끝(최대 스크롤)에 먼저 닿아버리는 문제 — DesktopSection5와 동일한
  // 이유로 'end end'를 쓴다.
  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.5, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.5, 1], [40, 0])

  // style={{opacity: motionValue}} 반응형 바인딩이 이 코드베이스에서 간헐적으로
  // 멈추는 문제가 있어(DesktopSection5와 동일 원인) ref로 우회한다.
  // reduceMotion일 때는 style 자체를 안 걸어 항상 보이므로 여기서도 건드리지 않는다.
  useMotionValueEvent(entranceOpacity, 'change', (v) => {
    if (reduceMotion) return
    if (videoRef.current) videoRef.current.style.opacity = String(v)
    if (contentRef.current) contentRef.current.style.opacity = String(v)
  })

  return (
    <section
      ref={sectionRef}
      className="relative mt-x10 overflow-hidden px-x5 pb-[100px] pt-x10"
    >
      <motion.video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src={teamChoiceBgVideo}
        className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 object-cover"
        style={reduceMotion ? undefined : { opacity: entranceOpacity.get() }}
      />

      <motion.div
        ref={contentRef}
        className="relative mx-auto flex w-full max-w-[488px] flex-col items-center gap-x10 md:max-w-[900px]"
        style={
          reduceMotion
            ? undefined
            : { opacity: entranceOpacity.get(), y: entranceY }
        }
      >
        <h2 className="text-center text-title-2-medium text-text-primary md:text-title-1-medium">
          {TITLE}
        </h2>

        <TeamCards
          hoverable={canHover}
          className="flex w-full flex-col items-center gap-x6 md:flex-row md:items-start md:justify-center"
          cardClassName="w-full md:min-w-0 md:flex-1"
        />
      </motion.div>
    </section>
  )
}

export default function Section5() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg

  if (!isDesktop) {
    return <StaticSection5 />
  }

  return <DesktopSection5 />
}
