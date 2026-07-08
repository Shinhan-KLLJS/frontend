import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * 디자인 토큰 미리보기.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Typography: Story = {
  render: () => (
    <div className="font-sans p-8">
      <p className="text-3xl font-bold">Pretendard · 프리텐다드 · Bold</p>
      <p className="text-lg">
        본문 텍스트 · The quick brown fox · 다람쥐 · Regular
      </p>
      <p className="text-sm text-text-caption">
        타이포 스케일 · 레이아웃 토큰은 DV-58 / DV-59에서 추가됩니다.
      </p>
    </div>
  ),
}

// Semantic 컬러 토큰
const semanticColors: Record<
  string,
  { name: string; cssVar: string; hex: string; ref: string; desc?: string }[]
> = {
  Bg: [
    {
      name: 'Bg/Primary',
      cssVar: '--color-bg-primary',
      hex: '#f4f4f5',
      ref: 'Cool Neutral/20',
      desc: '화면 기본 배경',
    },
    {
      name: 'Bg/Secondary',
      cssVar: '--color-bg-secondary',
      hex: '#ffffff',
      ref: 'Cool Neutral/0',
      desc: '카드 등 2차 배경',
    },
    {
      name: 'Bg/Tertiary',
      cssVar: '--color-bg-tertiary',
      hex: '#dbdcdf',
      ref: 'Cool Neutral/50',
      desc: '3차 배경, 구분 영역',
    },
    {
      name: 'Bg/Disabled',
      cssVar: '--color-bg-disabled',
      hex: '#eaebec',
      ref: 'Cool Neutral/30',
      desc: '비활성 요소 배경',
    },
    {
      name: 'Bg/Negative',
      cssVar: '--color-bg-negative',
      hex: '#feecec',
      ref: 'Red/50',
    },
    {
      name: 'Bg/Cautionary',
      cssVar: '--color-bg-cautionary',
      hex: '#fef4e6',
      ref: 'Orange/50',
    },
    {
      name: 'Bg/Positive',
      cssVar: '--color-bg-positive',
      hex: '#d9ffe6',
      ref: 'Green/50',
    },
    {
      name: 'Bg/Info',
      cssVar: '--color-bg-info',
      hex: '#e5f6fe',
      ref: 'Light Blue/50',
    },
  ],
  Text: [
    {
      name: 'Text/Primary',
      cssVar: '--color-text-primary',
      hex: '#0f0f10',
      ref: 'Cool Neutral/950',
    },
    {
      name: 'Text/Secondary',
      cssVar: '--color-text-secondary',
      hex: '#5a5c63',
      ref: 'Cool Neutral/600',
    },
    {
      name: 'Text/Tertiary',
      cssVar: '--color-text-tertiary',
      hex: '#70737c',
      ref: 'Cool Neutral/500',
    },
    {
      name: 'Text/Caption',
      cssVar: '--color-text-caption',
      hex: '#878a93',
      ref: 'Cool Neutral/400',
    },
    {
      name: 'Text/Primary-inverse',
      cssVar: '--color-text-primary-inverse',
      hex: '#ffffff',
      ref: 'Cool Neutral/0',
    },
    {
      name: 'Text/Secondary-inverse',
      cssVar: '--color-text-secondary-inverse',
      hex: '#878a93',
      ref: 'Cool Neutral/400',
    },
    {
      name: 'Text/Disabled',
      cssVar: '--color-text-disabled',
      hex: '#989ba2',
      ref: 'Cool Neutral/300',
    },
    {
      name: 'Text/Disabled-secondary',
      cssVar: '--color-text-disabled-secondary',
      hex: '#c2c4c8',
      ref: 'Cool Neutral/100',
    },
    {
      name: 'Text/Placeholder',
      cssVar: '--color-text-placeholder',
      hex: '#878a93',
      ref: 'Cool Neutral/400',
    },
    {
      name: 'Text/Brand',
      cssVar: '--color-text-brand',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Text/Negative',
      cssVar: '--color-text-negative',
      hex: '#ff4242',
      ref: 'Red/500',
    },
    {
      name: 'Text/Negative-contrast',
      cssVar: '--color-text-negative-contrast',
      hex: '#b00c0c',
      ref: 'Red/700',
    },
    {
      name: 'Text/Cautionary',
      cssVar: '--color-text-cautionary',
      hex: '#d47800',
      ref: 'Orange/600',
    },
    {
      name: 'Text/Positive',
      cssVar: '--color-text-positive',
      hex: '#006e25',
      ref: 'Green/700',
    },
    {
      name: 'Text/Info',
      cssVar: '--color-text-info',
      hex: '#008dcf',
      ref: 'Light Blue/600',
    },
  ],
  Line: [
    {
      name: 'Line/Primary',
      cssVar: '--color-line-primary',
      hex: '#c2c4c8',
      ref: 'Cool Neutral/100',
    },
    {
      name: 'Line/Secondary',
      cssVar: '--color-line-secondary',
      hex: '#dbdcdf',
      ref: 'Cool Neutral/50',
    },
    {
      name: 'Line/Tertiary',
      cssVar: '--color-line-tertiary',
      hex: '#eaebec',
      ref: 'Cool Neutral/30',
    },
    {
      name: 'Line/Disabled',
      cssVar: '--color-line-disabled',
      hex: '#dbdcdf',
      ref: 'Cool Neutral/50',
    },
    {
      name: 'Line/Brand',
      cssVar: '--color-line-brand',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Line/Negative',
      cssVar: '--color-line-negative',
      hex: '#ff4242',
      ref: 'Red/500',
    },
    {
      name: 'Line/Positive',
      cssVar: '--color-line-positive',
      hex: '#00bf40',
      ref: 'Green/500',
    },
    {
      name: 'Line/Info',
      cssVar: '--color-line-info',
      hex: '#00aeff',
      ref: 'Light Blue/500',
    },
    {
      name: 'Line/Focus',
      cssVar: '--color-line-focus',
      hex: '#6541f2',
      ref: 'Violet/500',
    },
  ],
  Chart: [
    {
      name: 'Chart/Categorical/1',
      cssVar: '--color-chart-categorical-1',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Chart/Categorical/2',
      cssVar: '--color-chart-categorical-2',
      hex: '#3a83f5',
      ref: 'Blue/400',
    },
    {
      name: 'Chart/Categorical/3',
      cssVar: '--color-chart-categorical-3',
      hex: '#0250ca',
      ref: 'Blue/600',
    },
    {
      name: 'Chart/Categorical/4',
      cssVar: '--color-chart-categorical-4',
      hex: '#6fa1f0',
      ref: 'Blue/300',
    },
    {
      name: 'Chart/Sequential/1',
      cssVar: '--color-chart-sequential-1',
      hex: '#cbdbf3',
      ref: 'Blue/100',
    },
    {
      name: 'Chart/Sequential/2',
      cssVar: '--color-chart-sequential-2',
      hex: '#6fa1f0',
      ref: 'Blue/300',
    },
    {
      name: 'Chart/Sequential/3',
      cssVar: '--color-chart-sequential-3',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Chart/Sequential/4',
      cssVar: '--color-chart-sequential-4',
      hex: '#023c97',
      ref: 'Blue/700',
    },
    {
      name: 'Chart/Sequential/5',
      cssVar: '--color-chart-sequential-5',
      hex: '#011432',
      ref: 'Blue/900',
    },
    {
      name: 'Chart/Diverging/Positive',
      cssVar: '--color-chart-diverging-positive',
      hex: '#ff4242',
      ref: 'Red/500',
    },
    {
      name: 'Chart/Diverging/Neutral',
      cssVar: '--color-chart-diverging-neutral',
      hex: '#dbdcdf',
      ref: 'Cool Neutral/50',
    },
    {
      name: 'Chart/Diverging/Negative',
      cssVar: '--color-chart-diverging-negative',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Chart/Grid',
      cssVar: '--color-chart-grid',
      hex: '#c2c4c8',
      ref: 'Cool Neutral/100',
    },
    {
      name: 'Chart/Axis-label',
      cssVar: '--color-chart-axis-label',
      hex: '#70737c',
      ref: 'Cool Neutral/500',
    },
    {
      name: 'Chart/Surface',
      cssVar: '--color-chart-surface',
      hex: '#f4f4f5',
      ref: 'Cool Neutral/20',
    },
  ],
  Primary: [
    {
      name: 'Primary/Brand-weak',
      cssVar: '--color-primary-brand-weak',
      hex: '#f3f6fb',
      ref: 'Blue/50',
    },
    {
      name: 'Primary/Brand-solid',
      cssVar: '--color-primary-brand-solid',
      hex: '#0365fc',
      ref: 'Blue/500',
    },
    {
      name: 'Primary/Brand-solid-hover',
      cssVar: '--color-primary-brand-solid-hover',
      hex: '#3a83f5',
      ref: 'Blue/400',
    },
    {
      name: 'Primary/Brand-solid-pressed',
      cssVar: '--color-primary-brand-solid-pressed',
      hex: '#0250ca',
      ref: 'Blue/600',
    },
    {
      name: 'Primary/Brand-solid-disabled',
      cssVar: '--color-primary-brand-solid-disabled',
      hex: '#c2c4c8',
      ref: 'Cool Neutral/100',
    },
  ],
}

export const Colors: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-8 p-8">
      {Object.entries(semanticColors).map(([group, tokens]) => (
        <section key={group}>
          <h2 className="mb-3 text-xl font-bold">{group}</h2>
          <div className="grid grid-cols-4 gap-3">
            {tokens.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <div
                  className="h-10 w-10 shrink-0 rounded-lg border border-(--color-line-tertiary)"
                  style={{ background: `var(${t.cssVar})` }}
                />
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="text-(--color-text-caption)">
                    {t.hex} ← {t.ref}
                  </p>
                  {t.desc && (
                    <p className="truncate text-(--color-text-tertiary)">
                      {t.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
}
