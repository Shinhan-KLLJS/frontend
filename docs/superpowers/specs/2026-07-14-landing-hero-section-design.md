# 랜딩페이지 Hero 섹션 — 스크롤 인터랙션 설계

**날짜:** 2026-07-14
**관련 브랜치:** feature/DV-90-landing-page
**Figma:** https://www.figma.com/design/Av6wndsR8wpp1w7BIduyyz/KLLJS?node-id=1900-24003
  - Desktop_Interaction Before: node `1900:24004`
  - Desktop_Interaction After: node `1900:24008`
  - Design Guide(마진 실측용): node `1900:24206`

## 실제 구현 반영 (요약)

> 아래 본문은 최초 설계 당시 기록이며, 이후 로컬 검증 과정에서 다음과 같이 바뀌었다. 정확한 수치는 `src/components/landing/ScrollHero.tsx` 코드 참고.

- **섹션 높이**: 260dvh → 여러 차례 조정 끝에 **230dvh**로 확정.
- **퇴장 방식이 완전히 바뀜**: "스크롤 진행률 0.97~1에서 고정된 채 페이드아웃"이 아니라, **sticky가 풀려 실제로 화면 밖으로 스크롤되어 나가는 구간**에 맞춰 사라지도록 변경. 이 구간이 Section 2가 화면에 들어오는 구간과 겹쳐 **크로스페이드**로 자연스럽게 이어진다(Section 2 작업 때 함께 조정됨).
- 배경(그라데이션)과 콘텐츠(헤드라인·대시보드)가 완전히 같은 값으로 사라지면 대비가 강한 콘텐츠가 먼저 사라지는 것처럼 보이는 착시가 있어, **배경이 콘텐츠보다 3% 먼저 사라지기 시작**하도록 의도적으로 어긋나게 설정.
- **등장 완료 시점**: 초기 구현은 15% 부근이었으나 여러 차례 조정 끝에 **35%**로 확정 (배경 축소·헤드라인·대시보드 모두 이 시점에 완료).
- **정지 유지(hold) 구간**을 크게 늘려 전체 스크롤의 대부분(약 65%)을 차지하도록 조정 — 다 나타난 상태가 충분히 오래 유지되도록.
- 배경용 별도 마스크 이미지(3번째 에셋)는 사용하지 않음 — `hero-bg.png` 하나에 `object-cover`만 적용해 단순화.
- 대시보드 이미지는 세로로 긴 원본(`hero-content.png`)이라 상단 일부만 잘라 보여주는 크롭 로직이 추가됨(설계 당시엔 파일명만 `hero-dashboard.png`로 다르게 기재).

## 배경

랜딩페이지 작업의 첫 섹션으로 Hero(첫 화면) 스크롤 인터랙션을 구현한다. 배경 그래픽이 화면 전체를 채운 상태에서 스크롤에 따라 축소되며, 헤드라인·CTA·대시보드 그래픽이 순서대로 나타나는 연출이다. 참고 인터랙션 스펙(다른 AI 제공)과 Figma Before/After 프레임을 기준으로 프로젝트 컨벤션에 맞게 재구성한다.

## 범위

- **포함:** Hero 섹션 본문(배경, 헤드라인, 바디 텍스트, CTA 버튼 2개, 대시보드 그래픽)의 스크롤 연동 인터랙션
- **제외:** 상단 헤더(서비스 소개/회원가입/로그인 네비게이션) — 별도 작업으로 분리
- **제외:** Hero 이후의 다른 랜딩 섹션들 — 이후 섹션별로 순차 진행

## 라우팅

현재 `/` 는 `RequireAuth`로 보호된 `HomePage`(로그인 후 대시보드)만 렌더링하며, 공개 랜딩 라우트가 없다.

`/` 를 인증 상태에 따라 분기하는 방식으로 전환한다 (`src/lib/auth.tsx`의 `useAuth().status` 사용):

| status | 렌더링 |
|---|---|
| `loading` | 기존 `RequireAuth`와 동일한 로딩 스피너 |
| `guest` | 신규 `LandingPage` (공개) |
| `authenticated` | 기존 `AppLayout` + `HomePage` |

`App.tsx`의 라우터 설정에서 `/` 엔트리를 이 분기 컴포넌트로 교체한다. `/login`, `/welcome` 등 기존 라우트는 변경 없음.

## 파일 구조

```
src/pages/LandingPage.tsx          # 랜딩페이지, 섹션들을 조립 (지금은 Hero만)
src/components/landing/
  ScrollHero.tsx                   # Hero 섹션 (스크롤 인터랙션 포함)
  index.ts                         # barrel export (components/ui/index.ts와 동일 컨벤션)
src/lib/useMediaQuery.ts           # 반응형 분기용 훅 (lib/api.ts, lib/auth.tsx와 같은 위치)
src/assets/landing/
  hero-bg.png                      # 배경 그래픽 (Figma "image 88 1")
  hero-dashboard.png               # 대시보드 그래픽 (Figma "[DV-44] 메인화면 홈 대시보드 2")
```

## Hero 인터랙션 동작

### 라이브러리

`motion`(npm) 신규 설치. `useScroll` + `useTransform`으로 스크롤 진행률 기반 애니메이션을 구현한다.

### 데스크탑 (`lg`, 1280px 이상)

- 스크롤 영역 높이 ~260dvh, 내부 컨텐츠는 `position: sticky; top: 0`으로 고정.
- 스크롤 진행률(0~1)에 따라 3단계로 변형:
  1. **배경**: `scale(1)` → `scale(~0.78)` + Y translate. `width/height` 대신 `transform`만 사용(리플로우 방지).
  2. **헤드라인 + CTA**: opacity 0→1, Y translate 24px→0.
  3. **대시보드 그래픽**: opacity 0→1, Y translate 140px→0. 배경 카드 축소가 어느 정도 진행된 뒤 시작.
- 각 구간의 정확한 스크롤 임계값과 최종 배치는 Figma 실측값 기준: 배경 최종 폭 ≈ 78%(996/1280), 대시보드 폭 ≈ 88%(876/996), 헤딩→버튼 32px, 버튼→대시보드 32px, 헤드라인 타이틀→바디 8px.

### `lg` 미만 (모바일/태블릿)

- `useMediaQuery`로 `lg` 미만 감지 시 스크롤 스페이서를 제거(`height: auto`)하고 `sticky` 대신 일반 흐름으로 배치.
- 애니메이션 구간 없이 최종 상태(축소된 배경 + 헤드라인 + CTA + 대시보드)를 정적으로 바로 표시.

### 접근성

- `prefers-reduced-motion` 사용자는 데스크탑이어도 스크롤 연동 없이 최종 상태 고정(모바일과 동일 처리).

## 에셋 & 토큰 매핑

| Figma 요소 | 매핑 |
|---|---|
| 타이틀→바디 간격 8px | `spacing-x2` |
| 헤딩→버튼 간격 32px | `spacing-x8` |
| 버튼→대시보드 간격 32px | `spacing-x8` |
| 섹션 상하 패딩 40px | `spacing-x10` |
| 섹션 좌우 패딩 60px | 토큰 스케일에 없음 → 임의값(arbitrary) 사용 |
| "서비스 둘러보기" 버튼 | 기존 `Button` 컴포넌트, `variant="line" color="secondary"` |
| "무료로 시작하기" 버튼 | 기존 `Button` 컴포넌트, `variant="default" color="primary"` |

이미지 3개(`hero-bg`, `hero-dashboard`, 마스크)는 Figma에서 다운로드해 `src/assets/landing/`에 커밋한다(원격 Figma 에셋 URL은 7일 후 만료되므로 코드에 직접 참조하지 않음).

## 검증

- 로컬 `pnpm dev`(또는 프로젝트 스크립트)로 데스크탑/태블릿/모바일 뷰포트에서 직접 스크롤해 확인.
- `prefers-reduced-motion: reduce` 시뮬레이션(브라우저 devtools)으로 정적 상태 확인.
- 사용자(디자이너)가 로컬에서 결과물 확인 후 승인해야 커밋 진행 (프로젝트 공통 규칙).

## 미해결/후속 논의 필요 사항

- 없음 — 위 항목은 모두 사용자 확인 완료.
