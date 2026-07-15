# 랜딩페이지 Section 3 — 캠페인 등록 플로우 캐러셀 설계

**날짜:** 2026-07-15
**관련 브랜치:** feature/DV-90-landing-page
**Figma:** https://www.figma.com/design/Av6wndsR8wpp1w7BIduyyz/KLLJS?node-id=1934-25620 (Frame 19, 3개 상태로 중복 표시됨: 기본 정보 입력/송출 위치 선택/최종 확인)

## 배경

Hero(Section 1) → Section 2(카드 마퀴→TOLA Data→위젯) 다음에 이어지는 새 섹션. 캠페인 등록 과정을 3단계 탭 + 이미지 캐러셀로 보여준다. Section 2와 달리 sticky 스크롤 핀 인터랙션이 아니라, 일반 스크롤 흐름 안에서 진입 애니메이션 + 탭/드래그 캐러셀로 동작한다.

## 범위

- **포함:** 타이틀+바디, 3개 탭 버튼, 3장 이미지 좌우 슬라이드 캐러셀(탭 클릭 및 드래그 양방향 동기화), 진입 페이드업 애니메이션
- **제외:** 실제 캠페인 등록 폼 기능 — 스크린샷 이미지만 보여주는 정적 쇼케이스

## 데이터

```ts
const STEPS = [
  { key: 'normal-info', label: '기본 정보 입력', image: normalInfoImage },
  { key: 'media-map', label: '송출 위치 선택', image: mediaMapImage },
  { key: 'last-check', label: '최종 확인', image: lastCheckInfoImage },
]
```

이미지 3장(`Normal-info.png` 4000×2592, `Media-Map.png`/`Last-Check-Info.png` 4000×2667 — 이미 `src/assets/landing/`에 있음)은 세로 비율이 살짝 다르지만(1.543 vs 1.5) Figma 원본처럼 `object-cover`로 통일해 고정 높이 트랙에 채운다.

## 레이아웃

- 섹션 전체: `flex flex-col items-center gap-x10`, 상하 패딩 `p-[100px]`(Figma 실측)
- 헤딩: 타이틀 "캠페인 등록"(36px medium, 중앙정렬) + 바디 "광고 영상을 업로드하고 송출할 지역과 매체를 선택해 캠페인을 등록할 수 있어요"(22px regular), 둘 사이 gap-x3
- 탭 그룹: `bg-bg-primary rounded-full p-x3 gap-x4` 알약형 컨테이너 안에 탭 버튼 3개
  - 선택됨: `bg-primary-brand-solid rounded-full px-x4 py-x3` + 흰 글씨(`text-text-primary-inverse`) `text-body-1-normal-bold`
  - 비선택: 투명 배경, `text-text-primary`, 같은 패딩/타이포
  - 기존 `Chip`·`ui/TextButton`과 색상 체계가 달라 이 섹션 전용 작은 탭 버튼 컴포넌트를 새로 만든다(재사용 안 함)
- 캐러셀: `w-full max-w-[1000px]` 컨테이너, 고정 높이 트랙(667px 기준, Figma 실측 중 더 큰 값), `overflow-hidden rounded-[16px]`, 내부에 3장 이미지가 가로로 나란히 배치된 트랙을 `translateX(-{activeIndex * 100}%)`로 슬라이드. 트랙 자체(또는 캐러셀 컨테이너)에 `shadow-normal-large` 적용.

## 인터랙션

1. **탭 클릭**: 클릭한 탭의 인덱스로 `activeIndex` 상태 변경 → 트랙이 해당 위치로 슬라이드 애니메이션(Motion `animate`, spring 또는 ease-out).
2. **드래그**: 이미지 트랙에 Motion `drag="x"` 적용, `dragConstraints`로 좌우 끝 제한. 드래그 종료(`onDragEnd`) 시 이동 거리가 캐러셀 폭의 25%를 넘으면 다음/이전 인덱스로 스냅, 아니면 원래 위치로 복귀.
3. **양방향 동기화**: 드래그로 슬라이드가 바뀌면 `activeIndex`가 갱신되고, 탭 그룹의 선택 표시도 자동으로 따라간다(단일 `activeIndex` 상태를 공유하므로 별도 동기화 로직 불필요).
4. **진입 애니메이션**: `useScroll({ target: sectionRef, offset: ['start end', 'start start'] })`로 얻은 진행률을 opacity(0→1)·y(40→0)에 매핑 — Hero→Section2 전환에 쓰인 것과 동일한 크로스페이드 패턴. 문서 흐름상 바로 위가 Section 2라, Section 2가 화면 밖으로 스크롤되는 시점과 자연히 겹쳐 "이전 섹션 그라디언트 BG가 다 올라가면 아래에서 위로 페이드인"이 구현된다. 별도의 "이전 섹션 감시" 로직은 필요 없다.

## 반응형

Section 2와 달리 sticky pin이 없는 일반 스크롤 컴포넌트라, 데스크탑 전용/정적 버전으로 나누지 않는다. `w-full max-w-[1000px]` 기준 반응형 너비로 데스크탑·태블릿·모바일에 공통 대응하고, 터치 드래그는 모바일에서 자연스럽게 동작한다. `prefers-reduced-motion`이면 진입 애니메이션은 즉시 나타나는 것으로 대체(`initial={false}` 패턴, 기존 컴포넌트들과 동일).

## 파일 구조

- `src/components/landing/Section3.tsx` (신규)
- `src/pages/LandingPage.tsx` 수정: `<Section2 />` 다음에 `<Section3 />` 추가
- `src/components/landing/index.ts` 수정: `Section3` export 추가

## 검증

- 탭 클릭 시 슬라이드·탭 선택 상태 동기화 확인
- 드래그로 슬라이드 전환 및 탭 자동 갱신 확인 (임계값 미만 드래그는 원위치 복귀)
- 스크롤 진입 시 Section 2가 화면 밖으로 나가면서 이 섹션이 아래→위로 페이드인하는지 확인
- 모바일/태블릿 너비에서 레이아웃·터치 드래그 확인
- `prefers-reduced-motion` 정적 대체 확인
- 사용자(디자이너) 로컬 확인 후 승인 시 커밋

## 후속 작업

- 실제 캠페인 등록 폼 기능 구현(현재는 이미지 쇼케이스만)
