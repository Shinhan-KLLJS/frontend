import Button from '@/components/ui/Button'

export interface PlanCardProps {
  image: string
  title: string
  description: [string, string]
  buttonLabel: string
  onSelect: () => void
}

/** 분기 카드 — 상단 일러스트 + 하단 설명/CTA*/
export default function PlanCard({
  image,
  title,
  description,
  buttonLabel,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex h-[400px] w-[408px] items-end overflow-hidden rounded-x4 bg-bg-secondary p-x5 shadow-normal-xlarge`}
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
