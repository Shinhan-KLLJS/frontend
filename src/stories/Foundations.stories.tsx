import type { Meta, StoryObj } from '@storybook/react-vite'
import AppLayout from '@/components/layout/AppLayout'

/**
 * 디자인 토큰 미리보기.
 * 데이터는 Figma 'Design System — Variables'에서 추출한 tokens.css와 1:1.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Typography: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-10 p-8">
      <header>
        <h1 className="text-title-3-bold mb-2">Typography</h1>
      </header>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Display 1 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-1-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 1/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 56px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-1-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 1/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 56px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-1-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 1/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 56px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Display 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 40px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 40px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 40px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Display 3 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-3-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 3/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 36px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-3-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 3/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 36px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-display-3-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Display 3/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 36px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Title 1 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-1-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 1/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 32px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-1-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 1/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 32px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-1-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 1/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 32px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Title 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 28px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 28px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 28px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Title 3 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-3-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 3/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 24px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-3-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 3/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 24px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-title-3-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Title 3/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 24px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Heading 1 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-1-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 1/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 22px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-1-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 1/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 22px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-1-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 1/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 22px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Heading 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 20px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 20px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-heading-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Heading 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 20px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Headline 1 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-1-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 1/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 18px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-1-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 1/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 18px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-1-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 1/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 18px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Headline 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 17px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 17px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-headline-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Headline 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 17px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Body 1 · 6</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-normal-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Body 1/Normal - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Bold · 16px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-reading-bold whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Body 1/Reading - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Bold · 16px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-normal-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Body 1/Normal - Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Medium · 16px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-reading-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 1/Reading - Medium
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Medium · 16px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-normal-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 1/Normal - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Regular · 16px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-1-reading-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 1/Reading - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Regular · 16px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Body 2 · 6</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-normal-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Body 2/Normal - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Bold · 15px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-reading-bold whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Body 2/Reading - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Bold · 15px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-normal-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Body 2/Normal - Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Medium · 15px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-reading-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 2/Reading - Medium
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Medium · 15px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-normal-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 2/Normal - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Regular · 15px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-body-2-reading-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Body 2/Reading - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Regular · 15px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Label 1 · 6</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-normal-bold whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Label 1/Normal - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Bold · 14px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-reading-bold whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">Label 1/Reading - Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Bold · 14px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-normal-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Label 1/Normal - Medium
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Medium · 14px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-reading-medium whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Label 1/Reading - Medium
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Medium · 14px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-normal-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Label 1/Normal - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Normal - Regular · 14px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-1-reading-regular whitespace-nowrap">
              Ag 가나
            </p>
            <p className="text-caption-1-medium mt-3">
              Label 1/Reading - Regular
            </p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Reading - Regular · 14px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Label 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Label 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 13px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Label 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 13px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-label-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Label 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 13px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Caption 1 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-1-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 1/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 12px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-1-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 1/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 12px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-1-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 1/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 12px
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-label-1-normal-bold mb-3">Caption 2 · 3</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-2-bold whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 2/Bold</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Bold · 11px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-2-medium whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 2/Medium</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Medium · 11px
            </p>
          </div>
          <div className="rounded-lg border border-line-tertiary bg-bg-secondary p-4">
            <p className="text-caption-2-regular whitespace-nowrap">Ag 가나</p>
            <p className="text-caption-1-medium mt-3">Caption 2/Regular</p>
            <p className="text-caption-1-regular text-text-caption">
              Pretendard · Regular · 11px
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
}

const semanticColors: Record<
  string,
  { name: string; cssVar: string; hex: string; ref: string; desc?: string }[]
> = {
  Background·Bg: [
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
  Text·Text: [
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
  Line·Line: [
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
  Chart·Chart: [
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
  Primary·Primary: [
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
    <div className="font-sans flex flex-col gap-10 p-8">
      <header>
        <h1 className="text-title-3-bold mb-2">Colors</h1>
      </header>
      <div className="font-sans flex flex-col gap-8">
        {Object.entries(semanticColors).map(([group, tokens]) => (
          <section key={group}>
            <h2 className="text-heading-2-bold mb-3">{group}</h2>
            <div className="grid grid-cols-4 gap-3">
              {tokens.map((t) => (
                <div key={t.name} className="flex gap-3 flex-col">
                  <div
                    className="h-10 w-10 shrink-0 border border-(--color-line-tertiary)"
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
    </div>
  ),
}

export const Spacing: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-10 p-8">
      <header>
        <h1 className="text-title-3-bold mb-2">Spacing</h1>
      </header>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">XS · 2</span>
          <div className="w-xs h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X1 · 4</span>
          <div className="w-x1 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X2 · 8</span>
          <div className="w-x2 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X3 · 12</span>
          <div className="w-x3 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X4 · 16</span>
          <div className="w-x4 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X5 · 20</span>
          <div className="w-x5 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X6 · 24</span>
          <div className="w-x6 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X7 · 28</span>
          <div className="w-x7 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X8 · 32</span>
          <div className="w-x8 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">X10 · 40</span>
          <div className="w-x10 h-4 max-w-full bg-bg-tertiary" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-caption-1-medium w-20 shrink-0">
            Full · 999
          </span>
          <div
            className="h-4 max-w-full bg-bg-tertiary"
            style={{ width: 'var(--spacing-full)' }}
          />
        </div>
      </div>
    </div>
  ),
}

export const Shadow: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-10 p-8">
      <header>
        <h1 className="text-title-3-bold mb-2">Shadow</h1>
      </header>
      <section>
        <h2 className="text-label-1-normal-bold mb-6">Normal</h2>
        <div className="flex flex-wrap gap-10">
          <div className="flex flex-col items-center gap-3">
            <div className="shadow-normal-xsmall size-16 rounded-2xl border border-line-tertiary bg-bg-secondary" />
            <div className="text-center">
              <p className="text-caption-1-medium">Xsmall</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="shadow-normal-small size-16 rounded-2xl border border-line-tertiary bg-bg-secondary" />
            <div className="text-center">
              <p className="text-caption-1-medium">Small</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="shadow-normal-medium size-16 rounded-2xl border border-line-tertiary bg-bg-secondary" />
            <div className="text-center">
              <p className="text-caption-1-medium">Medium</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="shadow-normal-large size-16 rounded-2xl border border-line-tertiary bg-bg-secondary" />
            <div className="text-center">
              <p className="text-caption-1-medium">Large</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="shadow-normal-xlarge size-16 rounded-2xl border border-line-tertiary bg-bg-secondary" />
            <div className="text-center">
              <p className="text-caption-1-medium">Xlarge</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
}

export const Layout: Story = {
  render: () => (
    <div className="font-sans flex flex-col gap-10 p-8">
      <header>
        <h1 className="text-title-3-bold mb-2">Layout</h1>
      </header>

      <section>
        <h2 className="text-label-1-normal-bold mb-3">App Shell</h2>
        <div className="h-90 overflow-hidden rounded-lg border border-line-tertiary">
          {/* 실제 AppLayout을 그대로 렌더 (목업 아님, 레이아웃 변경 시 자동 반영) */}
          <AppLayout>
            <p className="text-body-2-normal-regular text-text-tertiary">
              콘텐츠 영역
            </p>
          </AppLayout>
        </div>
      </section>

      <section>
        <h2 className="text-label-1-normal-bold mb-3">Content Width</h2>
        <div className="flex flex-col gap-2">
          <div className="max-w-content-lg rounded-sm bg-chart-sequential-2 px-x3 py-x1">
            <span className="text-caption-1-medium text-text-primary-inverse">
              content-lg · 1040
            </span>
          </div>
          <div className="max-w-content-xl rounded-sm bg-primary-brand-solid px-x3 py-x1">
            <span className="text-caption-1-medium text-text-primary-inverse">
              content-xl · 1280
            </span>
          </div>
        </div>
      </section>
    </div>
  ),
}
