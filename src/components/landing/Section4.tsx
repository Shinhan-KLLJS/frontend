import { useRef } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import Button from '@/components/ui/Button'
import { useMediaQuery } from '@/lib/useMediaQuery'
import campaignListImage from '@/assets/landing/Campaign-List.png'

const TITLE = '캠페인 리스트'
const BODY =
  '집행 상태, 기간, 매치 위치, 금일 송출 횟수 등 캠페인별 정보를 확인하고 관리하세요.'

/**
 * 데스크탑(lg 이상) 전용. sectionRef·useScroll을 이 컴포넌트 안에 둬야 한다 —
 * lg 미만으로 줄였다 다시 늘릴 때 완전히 새로 마운트되게 해서 스크롤 추적이
 * 죽지 않도록 한다(ScrollHero의 DesktopScrollHero와 동일한 이유).
 *
 * 텍스트는 좌측 고정 폭(367px)에 두고 오퍼시티만 페이드인한다 — 이미지 폭
 * (1200→793)에 맞춰 반응형으로 리플로우하지 않는다. 이미지는 우측
 * 고정단(right-0)을 기준으로 폭만 줄어든다. 텍스트에도 이미지와 같은
 * y(imageY)를 적용해, 이미지가 imageSettleY로 내려가며 리센터링될 때
 * 텍스트 상단도 함께 내려가 이미지와 top 기준으로 정렬되도록 한다.
 *
 * top-0로 고정한 채 폭만 줄이면 줄어든 만큼의 여백이 전부 아래로만 쌓여서
 * 이미지가 계속 화면 상단에 붙어있는 것처럼 보인다. 텍스트 위치는 그대로
 * 두되, 이미지에는 폭이 줄어드는 만큼(=높이가 줄어드는 만큼) y를 함께
 * 내려주는 imageSettleY를 더해 최종 상태에서 834px 높이 기준 세로 중앙에
 * 오도록 리센터링한다.
 *
 * `-mt-[150dvh]`로 앞 섹션(Section3)의 sticky-pin 구간과 겹치게 당겨서,
 * Section3가 화면에 고정된 채로 이 이미지가 그 위로 올라와 덮는 것처럼
 * 보이게 한다. sticky 요소의 실제 pin 거리는 (wrapper 높이 - 100dvh)라서,
 * margin도 이 기준으로 계산해야 한다 — wrapper 높이를 그대로 썼다가
 * Section3의 pin이 이 섹션이 시작하기도 전에 끝나버리는 버그를 겪었다.
 * 배경색은 따로 깔지 않는다 — Section3가 다 덮이기 전에 불투명 배경이
 * 먼저 화면 전체를 채우면 이미지가 자라기도 전에 뒤 내용이 갑자기 잘려
 * 보인다(실제로 겪은 버그).
 */
function DesktopSection4() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const imageEntranceY = useTransform(scrollYProgress, [0, 0.3], [600, 0])
  const imageWidth = useTransform(scrollYProgress, [0.3, 0.92], [1200, 793])
  const imageSettleY = useTransform(
    imageWidth,
    (w) => (834 - (w * 551) / 793) / 2,
  )
  const imageY = useTransform([imageEntranceY, imageSettleY], (values) =>
    (values as number[]).reduce((a, b) => a + b, 0),
  )
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.92], [0, 1])
  // style={{opacity: textOpacity}}로 반응형 바인딩하면 이 코드베이스에서
  // 종종 중간에 업데이트가 멈추고 0으로 굳어버리는 문제가 있다(원인 불명,
  // Section2 TOLA 타이틀에서도 겪음) — ref에 직접 opacity를 써서 우회한다.
  useMotionValueEvent(textOpacity, 'change', (v) => {
    if (textRef.current) textRef.current.style.opacity = String(v)
  })

  return (
    <section ref={sectionRef} className="relative -mt-[150dvh] h-[220dvh]">
      <div className="pointer-events-none sticky top-0 flex h-dvh items-center overflow-hidden px-x10">
        <div className="relative mx-auto h-[834px] w-full max-w-[1200px]">
          <motion.div
            ref={textRef}
            className="pointer-events-auto absolute left-0 top-0 w-[367px]"
            style={{ opacity: textOpacity.get(), y: imageY }}
          >
            <h2 className="text-display-3-medium text-text-primary">
              {TITLE}
            </h2>
            <p className="mt-x3 text-heading-1-regular text-text-primary">
              {BODY}
            </p>
            <Button variant="default" color="primary" size="large" className="mt-x10">
              캠페인 등록하러 가기
            </Button>
          </motion.div>

          <motion.img
            src={campaignListImage}
            alt={TITLE}
            className="absolute right-0 top-0 aspect-[793/551] rounded-[16px] object-cover shadow-normal-large"
            style={{ width: imageWidth, y: imageY }}
          />
        </div>
      </div>
    </section>
  )
}

/** lg 미만(태블릿·모바일): 세로 스택 정적 레이아웃, 진입 시 fade-up만 적용. */
function StaticSection4() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress: entranceProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })
  const entranceOpacity = useTransform(entranceProgress, [0.5, 1], [0, 1])
  const entranceY = useTransform(entranceProgress, [0.5, 1], [40, 0])

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center gap-x10 px-x5 py-[100px]"
    >
      <motion.div
        className="flex w-full flex-col items-center gap-x10"
        style={
          reduceMotion ? undefined : { opacity: entranceOpacity, y: entranceY }
        }
      >
        <div className="flex flex-col items-center gap-x3 text-center">
          <h2 className="text-display-3-medium text-text-primary">{TITLE}</h2>
          <p className="text-heading-1-regular text-text-primary">{BODY}</p>
        </div>

        <img
          src={campaignListImage}
          alt={TITLE}
          className="aspect-[793/551] w-full max-w-[1000px] rounded-[16px] object-cover shadow-normal-large"
        />
      </motion.div>
    </section>
  )
}

export default function Section4() {
  const isDesktop = useMediaQuery('(min-width: 1280px)') // tokens.css --breakpoint-lg

  if (!isDesktop) {
    return <StaticSection4 />
  }

  return <DesktopSection4 />
}
