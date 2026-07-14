import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import CampaignInfoForm from '@/components/campaign/CampaignInfoForm'
import { Icon, ProgressBar } from '@/components/ui'
import { campaignInfoSchema } from '@/lib/campaign'
import type { CampaignInfoValues } from '@/lib/campaign'

const REGISTER_STEPS = ['기본 정보', '매체 선택', '최종 확인']

type RegisterStep = 1 | 2 | 3

const STEP_SUBTITLE: Record<RegisterStep, string> = {
  1: '광고 영상 및 기본 정보를 입력하세요.',
  2: '광고를 송출할 매체를 선택하세요.',
  3: '마지막으로 입력한 정보가 올바른지 확인하세요.',
}

/**
 * 캠페인 등록 — 3단계 위저드 (기본 정보 → 매체 선택 → 최종 확인).
 * 폼·업로드·매체 선택 상태는 단계 왕복에도 보존되도록 전부 이 페이지가 소유한다
 * (step 컴포넌트는 전환 시 언마운트되므로 하위에 상태를 두지 않는다)
 */
export default function CampaignRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<RegisterStep>(1)

  // Step1 기본 정보 폼 — 단계를 오가도 값이 유지되도록 페이지가 인스턴스를 소유
  const form = useForm<CampaignInfoValues>({
    resolver: zodResolver(campaignInfoSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      brand: '',
      period: {},
      dailyPlayCount: '',
      memo: '',
    },
  })

  // 뒤로가기: 2·3단계는 이전 단계로, 1단계는 위저드를 벗어나 캠페인 리스트로
  const handleBack = () => {
    if (step > 1) setStep((step - 1) as RegisterStep)
    else navigate('/campaigns')
  }

  return (
    // 기본 높이(890)를 넘는 경우 최하단 여백 80px (Figma 가이드)
    <section className="flex min-h-full flex-col pb-[80px]">
      <header className="flex items-end justify-between gap-x5 p-x5">
        <div className="flex min-w-0 flex-1 items-start">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={handleBack}
            className="cursor-pointer rounded-x1 py-[7px] text-text-primary interaction-normal"
          >
            <Icon icon={ChevronLeft} size="large" />
          </button>
          <div className="flex min-w-0 flex-col gap-x2 px-x1">
            <h1 className="text-title-2-medium text-text-primary">
              캠페인 등록
            </h1>
            <p className="text-heading-2-regular text-text-primary">
              {STEP_SUBTITLE[step]}
            </p>
          </div>
        </div>
        <ProgressBar
          steps={REGISTER_STEPS}
          currentStep={step}
          className="w-[225px] shrink-0"
        />
      </header>

      <div className="flex flex-1 items-stretch gap-x5 p-x5">
        {step === 1 && (
          <>
            {/* 영상 업로드 카드 — DV-142에서 구현 */}
            <div className="min-h-[608px] min-w-[470px] flex-1 rounded-x4 border border-line-tertiary bg-bg-secondary p-x10 lg:max-w-[552px]" />
            <CampaignInfoForm form={form} onNext={() => setStep(2)} />
          </>
        )}
        {step !== 1 && (
          // 매체 선택·최종 확인 — 후속 커밋에서 구현
          <p className="text-body-2-normal-regular text-text-tertiary">
            단계 콘텐츠 준비 중
          </p>
        )}
      </div>
    </section>
  )
}
