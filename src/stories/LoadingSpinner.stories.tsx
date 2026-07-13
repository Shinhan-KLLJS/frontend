import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// 로딩 스피너
const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    showLabel: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof LoadingSpinner>

/** 매트릭스 : 0 / 25 / 50 / 75 / 100 */
export const States: Story = {
  render: () => (
    <div className="font-sans flex gap-x4">
      {[0, 25, 50, 75, 100].map((p) => (
        <section
          key={p}
          className="flex w-24 flex-col items-center gap-x3 rounded-lg border border-line-tertiary bg-bg-secondary p-x4"
        >
          <h3 className="text-label-1-normal-bold text-text-secondary">{p}%</h3>
          <LoadingSpinner progress={p} />
        </section>
      ))}
    </div>
  ),
}

function PlaygroundDemo() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(
      () => setProgress((prev) => (prev >= 100 ? 0 : prev + 5)),
      400,
    )
    return () => clearInterval(timer)
  }, [])
  return <LoadingSpinner progress={progress} />
}

export const Playground: Story = {
  render: () => <PlaygroundDemo />,
}
