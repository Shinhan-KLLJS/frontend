# 랜딩페이지 Section 2 — 빌드업 카드 마퀴 설계

**날짜:** 2026-07-14
**관련 브랜치:** feature/DV-90-landing-page
**Figma:** https://www.figma.com/design/Av6wndsR8wpp1w7BIduyyz/KLLJS?node-id=1912-24559
  - Section2 Design Guide (레이아웃 실측): node `1912:24563`

## 배경

Hero 섹션 다음에 오는 두 번째 섹션. "우리 서비스를 이용해 측정하세요"(섹션 3)로 이어지기 위한 빌드업 성격 — 옥외광고를 유동인구로만 예측하던 기존 방식의 한계를 텍스트 + 이미지 카드로 보여준다.

## 범위

- **포함:** 타이틀(2줄 헤드라인) + 6장 이미지 카드가 우→좌로 무한 반복되는 가로 마퀴, 섹션 진입 시 아래→위 페이드인
- **제외:** 섹션 3 이후 — 다음 작업으로 분리

## 레이아웃 (Figma 실측, 데스크탑 기준)

- 섹션 전체: 세로 flex, 상하 패딩 80px, 타이틀-카드 간격 40px(`spacing-x10`)
- 타이틀: 2줄, `text-display-2-medium` 토큰과 정확히 일치(40px/medium/line-height 1.3/letter-spacing -0.0282em) — 신규 토큰 불필요
- 카드: 387×387, radius 16px(토큰 스케일에 없어 arbitrary), 카드 간 간격 20px(`spacing-x5`)
- 이미지 6장(`section2-image1~6.png`)은 이미 1548×1548 정사각형으로 크롭되어 있어 별도 크롭 로직 없이 `object-cover`만 적용

## 동작

### 등장 애니메이션

Hero의 스크롤 핀(sticky) 방식과 다르게, 섹션이 뷰포트에 들어오는 시점에 **한 번만** 아래→위 페이드인(Motion `whileInView`, `viewport={{ once: true }}`). 스크롤을 다시 올려도 재생하지 않는다.

### 카드 마퀴 (우→좌 무한 루프)

- 6장 배열을 두 번 이어붙여 12개를 렌더링하고, 전체 너비의 절반만큼 `translateX`를 무한 반복(`repeat: Infinity, ease: 'linear'`)해 끊김 없이 순환시킨다.
- 섹션이 뷰포트 밖에 있을 때는 애니메이션을 일시정지한다(불필요한 렌더링 방지) — `whileInView`의 진입/이탈 콜백으로 재생/정지 토글.
- 마우스 호버 시 정지 등 별도 인터랙션은 없음(요청 시 추가).
- 정확한 루프 속도는 로컬에서 시각적으로 조정.

## 반응형

Figma 레퍼런스가 데스크탑 전용이라 아래 값은 제안 후 로컬에서 조정한다.

| 구간 | 카드 크기 | 카드 간격 |
|---|---|---|
| 데스크탑(`lg`, 1280px+) | 387×387 | 20px |
| 태블릿(`md`, 768~1279px) | 280×280 | 16px |
| 모바일(`~767px`) | 200×200 | 12px |

## 파일 구조

```
src/components/landing/
  Section2.tsx                     # 타이틀 + 카드 마퀴
  index.ts                         # barrel export에 Section2 추가
src/assets/landing/
  section2-image1~6.png            # 이미 제공됨 (사용자가 직접 배치)
```

`LandingPage.tsx`에 `<ScrollHero /><Section2 />` 순서로 조립.

## 검증

- 로컬에서 데스크탑/태블릿/모바일 뷰포트로 스크롤해 페이드인 타이밍과 마퀴 루프 확인
- `prefers-reduced-motion` 사용자는 마퀴를 정지 상태(또는 느리게)로 표시 — Hero와 동일하게 접근성 고려
- 사용자(디자이너) 로컬 확인 후 승인 시 커밋

## 미해결/후속 논의 필요 사항

- 없음 — 반응형 수치는 제안값으로 진행 후 로컬에서 조정
