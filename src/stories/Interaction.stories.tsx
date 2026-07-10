import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * 인터랙션 오버레이 유틸 미리보기.
 */
const meta: Meta = {
  title: 'Foundations/Interaction',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

const VARIANTS = [
  {
    utility: 'interaction-light',
    label: 'Light',
    note: 'Normal × 0.75',
    opacities: { hover: '3.75%', focus: '6%', press: '9%' },
  },
  {
    utility: 'interaction-normal',
    label: 'Normal',
    note: '기준',
    opacities: { hover: '5%', focus: '8%', press: '12%' },
  },
  {
    utility: 'interaction-strong',
    label: 'Strong',
    note: 'Normal × 1.5',
    opacities: { hover: '7.5%', focus: '12%', press: '18%' },
  },
] as const

/** 실제 hover / focus(Tab 키) / press로 확인하는 데모 */
export const Playground: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-6">
      <p className="text-label-1-normal-regular text-text-secondary">
        마우스 오버 · Tab 포커스 · 클릭(누르고 있기)으로 상태별 오버레이를
        확인하세요.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {VARIANTS.map(({ utility, label, note }) => (
          <button
            key={utility}
            type="button"
            className={`${utility} flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-line-tertiary bg-bg-secondary`}
          >
            <span className="text-label-1-normal-bold">{label}</span>
            <span className="text-caption-1-regular text-text-caption">
              {note}
            </span>
          </button>
        ))}
      </div>
      <div>
        <h2 className="text-label-1-normal-bold mb-3">오버레이 색 교체</h2>
        <button
          type="button"
          className="interaction-strong rounded-lg bg-primary-brand-solid px-6 py-3 text-label-1-normal-bold text-text-primary-inverse"
          style={{ '--interaction-color': 'white' } as React.CSSProperties}
        >
          어두운 배경 위에서는 --interaction-color로 색을 바꿔 사용
        </button>
      </div>
      <div>
        <h2 className="text-label-1-normal-bold mb-3">Disabled</h2>
        <button
          type="button"
          disabled
          className="interaction-normal rounded-lg border border-line-disabled bg-bg-disabled px-6 py-3 text-label-1-normal-regular text-text-disabled"
        >
          disabled면 오버레이가 뜨지 않음
        </button>
      </div>
    </div>
  ),
}

/** Figma 스펙 정적 매트릭스 — 상태별 투명도 값 */
export const Matrix: Story = {
  render: () => (
    <div className="font-sans flex gap-10">
      {VARIANTS.map(({ utility, label, opacities }) => (
        <div key={utility} className="flex flex-col gap-4">
          <h2 className="text-label-1-normal-bold text-center">{label}</h2>
          {(
            [
              ['Normal', '0%'],
              ['Hovered', opacities.hover],
              ['Focused', opacities.focus],
              ['Pressed', opacities.press],
            ] as const
          ).map(([state, value]) => (
            <div key={state} className="flex flex-col items-center gap-1">
              <div className="relative size-16 overflow-hidden rounded-md border border-line-tertiary bg-bg-secondary">
                <div
                  className="absolute inset-0 bg-[#171719]"
                  style={{ opacity: parseFloat(value) / 100 }}
                />
              </div>
              <span className="text-caption-1-medium">{state}</span>
              <span className="text-caption-2-regular text-text-caption">
                {value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}
