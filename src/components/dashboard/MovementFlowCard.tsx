import movementMap from '@/assets/dashboard/movement-map.png'

/** 지도 SDK 없이 제공되는 정적 이동 동선 미리보기입니다. */
export default function MovementFlowCard() {
  return (
    <section className="h-[348px] w-[376px] shrink-0 overflow-hidden rounded-x3 border border-line-tertiary bg-bg-secondary">
      <svg
        viewBox="0 0 376 348"
        role="img"
        aria-labelledby="movement-title movement-description"
        className="h-full w-full"
      >
        <title id="movement-title">LTS 비중이 가장 높은 이동 동선</title>
        <desc id="movement-description">
          피그마 지도 이미지 위에 48퍼센트의 주요 이동 동선이 표시된 정적
          미리보기
        </desc>
        <image href={movementMap} width="376" height="348" />
      </svg>
    </section>
  )
}
