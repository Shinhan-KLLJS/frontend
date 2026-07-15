interface ComingSoonPageProps {
  title?: string
}

/** 아직 구현되지 않은 메뉴용 placeholder 화면 */
export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="flex h-full flex-col items-center justify-center gap-x2 p-x10 text-center">
      <h1 className="text-title-3-bold text-text-primary">{title ?? '준비 중'}</h1>
      <p className="text-body-2-normal-regular text-text-tertiary">
        이 화면은 준비 중입니다.
      </p>
    </section>
  )
}
