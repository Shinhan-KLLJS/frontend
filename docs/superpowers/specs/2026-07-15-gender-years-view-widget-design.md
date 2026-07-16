# 랜딩페이지 Section 2 — Gender Years View 위젯 설계

**날짜:** 2026-07-15
**관련 브랜치:** feature/DV-90-landing-page
**Figma:** https://www.figma.com/design/Av6wndsR8wpp1w7BIduyyz/KLLJS?node-id=1919-27237 ("Gender Years View")

## 배경

Section 2(`src/components/landing/Section2.tsx`)의 5개 위젯 자리표시자 중 `gender-years-view`를 실제 인터랙티브 컴포넌트로 채운다. 나머지 4개 위젯(Live Viewer Graph, Best Flow, Time Years Heat Map, Average View Time)은 이번 범위에서 제외 — 계속 `PlaceholderCard`로 유지.

## 범위

- **포함:** 전체/남성/여성 칩 필터 + 연령대별 가로 바 차트 인터랙션
- **제외:** 실제 서버 데이터 연동 — 목데이터 사용 (후속 작업에서 API 연동 예정)
- **제외:** 나머지 4개 위젯의 실제 콘텐츠 구현

## 데이터 구조

연령대 7개, 성별 데이터셋 2개(남성/여성)만 존재. "전체" 탭은 별도 3번째 데이터셋 없이 남성·여성 데이터셋을 그대로 겹쳐 보여주는 방식(Figma 원본과 동일한 오버레이 비교 방식).

```ts
const AGE_GROUPS = ['0-9세', '10-19세', '20-29세', '30-39세', '40-49세', '50-59세', '60세 이상']
const MALE_DATA = [8, 12, 18, 17, 15, 16, 14] // 합 100
const FEMALE_DATA = [7, 13, 19, 18, 16, 15, 12] // 합 100
```

두 데이터셋 모두 합계 100%, 20대에 완만한 정점을 이루고 이후 서서히 감소하는 형태로 한쪽에 쏠리지 않게 구성.

## 인터랙션

`Chip`(`src/components/ui/Chip.tsx`) 컴포넌트로 전체/남성/여성 3개 필터. 기본 선택은 "전체". 로컬 `useState<'all' | 'male' | 'female'>` 로 관리.

### 전체 탭
연령대별 행마다 왼쪽부터 남성 바(진한 파랑) 다음에 여성 바(연한 파랑)가 겹치지 않고 이어서 그려지는 연속형 막대:
- 남성 바 — 왼쪽 시작(0), 폭은 `maleValue / maxOfBothDatasets * trackWidth`
- 여성 바 — 남성 바 끝 지점에서 시작, 폭은 `femaleValue / maxOfBothDatasets * trackWidth`

우측 라벨: 두 비율을 합친 값 `{maleValue + femaleValue}%` 단일 표시 (2026-07-16 결정: 성별 분리 표기 대신 합산값으로 변경)

### 남성 / 여성 탭
해당 성별 바만 단색으로 표시. 폭은 `value / maxOfThatDataset * trackWidth`(그 성별 데이터셋 내 최댓값 기준 스케일). 우측 라벨: `{value}%` 단일 표시.

## 스타일

- 남성 바: `bg-chart-categorical-1` (blue-500, Figma `#0365fc`와 일치)
- 여성 바: `bg-chart-sequential-1` (blue-100, Figma `#cbdbf3`와 일치)
- 트랙 배경: `bg-chart-surface`
- 칩: 기존 `Chip` 컴포넌트 재사용 (`selected` prop으로 활성 상태 표시)
- 범례(우측 상단 남성/여성 색상 표시)는 Figma 참조상 있지만, 칩 자체가 필터 겸 범례 역할을 하므로 생략 — 대신 "전체" 탭일 때만 헤더 우측에 작은 색상 범례를 둔다 (Figma와 동일하게 남성/여성 두 색이 항상 같이 보이므로 구분에 필요).

## 파일 구조

- `src/components/landing/GenderYearsView.tsx` (신규): 위젯 전체 컴포넌트, 칩 필터 상태 포함
- `src/components/landing/Section2.tsx` 수정: `WIDGETS` 배열의 `gender-years-view` 항목 렌더링 시 `PlaceholderCard` 대신 `<GenderYearsView />` 사용 (`DesktopSection2`의 위젯 map, `StaticSection2`의 `FadeInCard` children 두 곳)

## 반응형

이 위젯은 이미 부모(Section2의 위젯 그리드/스크롤 인터랙션)가 데스크탑/모바일 레이아웃을 관장하므로, 위젯 내부는 `size-full` 기준으로 유연하게 채워지도록만 구현하면 된다. 별도의 반응형 분기 불필요.

## 검증

- 전체/남성/여성 탭 전환 시 막대 길이·라벨이 올바르게 갱신되는지 로컬 확인
- 각 데이터셋 합계가 정확히 100인지 코드 리뷰로 확인
- `npx tsc -b && npm run lint` 통과
- 사용자(디자이너) 로컬 확인 후 승인 시 커밋

## 후속 작업

- 실제 API 데이터 연동 (현재는 목데이터)
- 나머지 4개 위젯(Live Viewer Graph, Best Flow, Time Years Heat Map, Average View Time) 구현
