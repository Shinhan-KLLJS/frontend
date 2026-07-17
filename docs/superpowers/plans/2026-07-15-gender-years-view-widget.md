# Gender Years View 위젯 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Section 2의 `gender-years-view` 위젯 자리표시자를 전체/남성/여성 칩 필터 + 연령대별 가로 바 차트로 채운다.

**Architecture:** 신규 `GenderYearsView` 컴포넌트(로컬 필터 상태 `useState`)를 만들어 `Section2.tsx`의 위젯 렌더링 두 곳(`DesktopSection2`의 위젯 map, `StaticSection2`의 `FadeInCard`)에서 `PlaceholderCard` 대신 사용한다. 차트는 recharts 없이 순수 div로 구현 (Figma 구조와 1:1 대응, 단순 가로 바이므로 라이브러리 불필요).

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (tokens.css 기반), 기존 `Chip` UI 컴포넌트.

## Global Constraints

- 이 프로젝트에는 테스트 프레임워크가 없다(`package.json` scripts에 test 없음) — 검증은 `npx tsc -b && npm run lint` + 로컬 dev 서버 시각 확인으로 대체한다.
- 색상은 반드시 `src/styles/tokens.css`의 토큰만 사용: 남성 바 `bg-chart-categorical-1`, 여성 바 `bg-chart-sequential-1`, 트랙 배경 `bg-chart-surface`.
- 칩 필터는 기존 `src/components/ui/Chip.tsx`를 재사용하고 새 칩 컴포넌트를 만들지 않는다.
- Prettier 컨벤션: 세미콜론 없음, single quote, trailing comma, printWidth 80, tabWidth 2.
- 커밋은 사용자의 로컬 확인·명시적 승인 후에만 한다 — 이 플랜의 마지막 커밋 스텝은 사용자 승인이 이미 있다는 전제하에 실행한다. 승인 전이면 커밋 스텝은 생략하고 사용자에게 확인을 요청한다.

---

### Task 1: GenderYearsView 컴포넌트 작성

**Files:**
- Create: `src/components/landing/GenderYearsView.tsx`

**Interfaces:**
- Produces: `export default function GenderYearsView({ className }: { className?: string })` — `Section2.tsx`가 `<GenderYearsView className="size-full" />` 형태로 사용.
- Consumes: `Chip` (default export) from `@/components/ui`.

- [ ] **Step 1: 컴포넌트 파일 작성**

```tsx
import { useState } from 'react'
import { Chip } from '@/components/ui'

const AGE_GROUPS = [
  '0-9세',
  '10-19세',
  '20-29세',
  '30-39세',
  '40-49세',
  '50-59세',
  '60세 이상',
] as const

// 각 연령대별 비율(%). 두 배열 모두 합계 100 — 20대에 완만한 정점을 이루고
// 이후 서서히 감소하는 형태로 한쪽에 쏠리지 않게 구성한 목데이터.
const MALE_DATA = [8, 12, 18, 17, 15, 16, 14]
const FEMALE_DATA = [7, 13, 19, 18, 16, 15, 12]

type Filter = 'all' | 'male' | 'female'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
]

function AgeGroupRow({
  label,
  filter,
  maleValue,
  femaleValue,
  maxValue,
}: {
  label: string
  filter: Filter
  maleValue: number
  femaleValue: number
  maxValue: number
}) {
  const maleWidth = `${(maleValue / maxValue) * 100}%`
  const femaleWidth = `${(femaleValue / maxValue) * 100}%`

  return (
    <div className="flex w-full items-center gap-x3">
      <span className="w-[60px] shrink-0 text-right text-label-1-normal-regular text-text-secondary">
        {label}
      </span>
      <div className="relative h-[16px] flex-1 rounded-x1 bg-chart-surface">
        {filter !== 'male' && (
          <div
            className="absolute inset-y-0 left-0 rounded-x1 bg-chart-sequential-1"
            style={{ width: femaleWidth }}
          />
        )}
        {filter !== 'female' && (
          <div
            className="absolute inset-y-0 left-0 rounded-x1 bg-chart-categorical-1"
            style={{ width: maleWidth }}
          />
        )}
      </div>
      <span className="w-[90px] shrink-0 text-right text-body-1-normal-medium text-text-primary">
        {filter === 'all' && `남 ${maleValue}% · 여 ${femaleValue}%`}
        {filter === 'male' && `${maleValue}%`}
        {filter === 'female' && `${femaleValue}%`}
      </span>
    </div>
  )
}

export default function GenderYearsView({
  className = '',
}: {
  className?: string
}) {
  const [filter, setFilter] = useState<Filter>('all')

  const maxValue =
    filter === 'male'
      ? Math.max(...MALE_DATA)
      : filter === 'female'
        ? Math.max(...FEMALE_DATA)
        : Math.max(...MALE_DATA, ...FEMALE_DATA)

  return (
    <div
      className={`flex flex-col gap-x4 rounded-[16px] bg-bg-secondary p-x5 shadow-normal-xlarge ${className}`}
    >
      <div className="flex flex-col gap-x4">
        <div className="flex items-center justify-between">
          <p className="text-heading-2-bold text-text-primary">
            성별・연령 시청 비율
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x1">
            {FILTERS.map(({ key, label }) => (
              <Chip
                key={key}
                selected={filter === key}
                size="medium"
                onClick={() => setFilter(key)}
              >
                {label}
              </Chip>
            ))}
          </div>
          {filter === 'all' && (
            <div className="flex items-center gap-x2">
              <div className="flex items-center gap-1">
                <span className="size-[12px] rounded-[2px] bg-chart-categorical-1" />
                <span className="text-label-1-normal-medium text-text-caption">
                  남성
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-[12px] rounded-[2px] bg-chart-sequential-1" />
                <span className="text-label-1-normal-medium text-text-caption">
                  여성
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-x2">
        {AGE_GROUPS.map((label, index) => (
          <AgeGroupRow
            key={label}
            label={label}
            filter={filter}
            maleValue={MALE_DATA[index]}
            femaleValue={FEMALE_DATA[index]}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 데이터 합계 검증**

`MALE_DATA`와 `FEMALE_DATA` 배열 각각을 눈으로 합산해 100인지 확인한다 (8+12+18+17+15+16+14=100, 7+13+19+18+16+15+12=100). 스펙 문서(`docs/superpowers/specs/2026-07-15-gender-years-view-widget-design.md`)의 값과 정확히 일치하는지 대조한다.

- [ ] **Step 3: 타입체크 실행**

Run: `npx tsc -b`
Expected: 에러 없음 (텍스트 토큰 클래스명이 실제 `tokens.css`에 존재하는지는 Step 4에서 lint/빌드로 재확인)

---

### Task 2: Section2.tsx에 위젯 연결

**Files:**
- Modify: `src/components/landing/Section2.tsx`

**Interfaces:**
- Consumes: `GenderYearsView` from Task 1 (`./GenderYearsView`).

- [ ] **Step 1: import 추가**

`src/components/landing/Section2.tsx` 최상단 import 블록(`import tolaDataImage from '@/assets/landing/TOLA-Data.png'` 바로 아래)에 추가:

```tsx
import GenderYearsView from './GenderYearsView'
```

- [ ] **Step 2: DesktopSection2의 위젯 렌더링 분기**

`WIDGETS.map((widget) => ( ... <PlaceholderCard label={widget.label} className="size-full" /> ... ))` 블록에서, `PlaceholderCard` 렌더링 부분을 다음과 같이 조건 분기한다:

```tsx
{widget.key === 'gender-years-view' ? (
  <GenderYearsView className="size-full" />
) : (
  <PlaceholderCard label={widget.label} className="size-full" />
)}
```

- [ ] **Step 3: StaticSection2의 위젯 렌더링 분기**

`StaticSection2`의 `WIDGETS.map((widget) => (<FadeInCard key={widget.key} reduceMotion={!!reduceMotion}><PlaceholderCard label={widget.label} className="aspect-[4/3] w-full" /></FadeInCard>))` 블록의 `FadeInCard` 자식을 다음과 같이 조건 분기한다:

```tsx
{WIDGETS.map((widget) => (
  <FadeInCard key={widget.key} reduceMotion={!!reduceMotion}>
    {widget.key === 'gender-years-view' ? (
      <GenderYearsView className="w-full" />
    ) : (
      <PlaceholderCard label={widget.label} className="aspect-[4/3] w-full" />
    )}
  </FadeInCard>
))}
```

- [ ] **Step 4: 타입체크 + 린트 실행**

Run: `npx tsc -b && npm run lint`
Expected: 에러 없음

- [ ] **Step 5: dev 서버 재시작**

기존에 떠 있는 background dev 서버가 있으면 종료 후 `npm run dev`를 다시 background로 실행한다 (이 세션에서 `Section2.tsx` 수정 후 매번 반복해온 패턴).

- [ ] **Step 6: 사용자 로컬 확인 요청**

사용자에게 전체/남성/여성 칩 전환, 바 길이·라벨 갱신, 데스크탑 스크롤 인터랙션 중 위젯 등장 구간, 모바일/태블릿(`StaticSection2`) 레이아웃을 로컬에서 확인해달라고 요청한다. **커밋은 사용자의 명시적 승인 후에만 진행한다 — 이 스텝에서 자동으로 커밋하지 않는다.**

---

## 검증 요약 (스펙 대비)

- 전체/남성/여성 칩 필터 → Task 1 Step 1 (Chip 재사용 + `filter` state)
- 연령대별 값 합계 100% (남녀 각각) → Task 1 Step 2
- 전체 탭 오버레이 비교, 남성/여성 탭 단색 표시 → Task 1 Step 1 (`AgeGroupRow`의 `filter !== 'male'`/`filter !== 'female'` 조건)
- `chart-categorical-1`/`chart-sequential-1`/`chart-surface` 토큰 사용 → Task 1 Step 1
- Section2.tsx 두 렌더링 지점(Desktop/Static) 연결 → Task 2
- 사용자 승인 후 커밋 → Task 2 Step 6
