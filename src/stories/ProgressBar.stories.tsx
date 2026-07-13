import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ProgressBar from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui'

const WIZARD_STEPS = ['기본 정보', '매체 선택', '최종 확인']

// 프로그레스 바 — 단계형 진행 바 (현재 단계 라벨 + 채움 비율)
const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    currentStep: { control: { type: 'range', min: 1, max: 3, step: 1 } },
  },
}
export default meta

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  args: {
    steps: WIZARD_STEPS,
    currentStep: 1,
  },
  render: (args) => (
    <div className="w-[225px]">
      <ProgressBar {...args} />
    </div>
  ),
}

/** 매트릭스 : 1 / 2 / 3 단계 */
export const States: Story = {
  render: () => (
    <div className="font-sans flex gap-x4">
      {[1, 2, 3].map((step) => (
        <section
          key={step}
          className="flex w-[273px] flex-col gap-x3 rounded-lg border border-line-tertiary bg-bg-secondary p-x4"
        >
          <h3 className="text-label-1-normal-bold text-text-secondary">
            {step}단계
          </h3>
          <ProgressBar steps={WIZARD_STEPS} currentStep={step} />
        </section>
      ))}
    </div>
  ),
}

function PlaygroundDemo() {
  const [step, setStep] = useState(1)
  return (
    <div className="flex w-[320px] flex-col gap-x5">
      <ProgressBar steps={WIZARD_STEPS} currentStep={step} />
      <div className="flex gap-x2">
        <Button
          size="small"
          color="secondary"
          disabled={step <= 1}
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
        >
          이전
        </Button>
        <Button
          size="small"
          disabled={step >= WIZARD_STEPS.length}
          onClick={() =>
            setStep((prev) => Math.min(WIZARD_STEPS.length, prev + 1))
          }
        >
          다음
        </Button>
      </div>
    </div>
  )
}

export const Playground: Story = {
  render: () => <PlaygroundDemo />,
}
