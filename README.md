# DDOOH Frontend

비전 AI 기반 옥외광고 성과 측정 플랫폼 **DDOOH**의 프론트엔드.
4계층 측정 모델(Traffic → OTS → LTS → Attention) 결과를 리포트로 시각화합니다.

> 현재는 **개발 환경 골격**만 구성된 상태입니다. 화면/기능은 기획 확정 후 단계적으로 구현합니다.

## 기술 스택

| 영역             | 기술                                            |
| ---------------- | ----------------------------------------------- |
| 언어             | TypeScript                                      |
| 빌드             | Vite 6 + React 19                               |
| 스타일           | Tailwind CSS v3 (theme 미정의 — 디자인 확정 후) |
| 코드 품질        | ESLint + Prettier                               |

**설치만 해둔 스택 라이브러리** (기획 확정 시 바로 사용):

- 라우팅: `react-router-dom`
- 서버 상태: `@tanstack/react-query`
- 클라이언트 상태: `zustand`
- HTTP: `axios`
- 폼/검증: `react-hook-form` + `zod`
- 차트: `recharts`

> 패키지 매니저는 **npm** 사용 (로컬 corepack 이슈로 pnpm 대신).
> Vite/TS는 Node 20.18.1 호환을 위해 안정 버전(Vite 6 / TS 5.8)으로 고정.

## 시작하기

```bash
npm install
cp .env.example .env.development   # 백엔드 주소 등 값 채우기
npm run dev                        # http://localhost:5173
```

## 스크립트

| 명령              | 설명                              |
| ----------------- | --------------------------------- |
| `npm run dev`     | 개발 서버                         |
| `npm run build`   | 타입체크(`tsc -b`) + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기                |
| `npm run lint`    | ESLint 검사                       |
| `npm run format`  | Prettier 포맷                     |

## 환경변수

`VITE_` 접두 변수는 **빌드 시점에 번들에 박히므로** 비밀키 금지(공개돼도 되는 값만). 실제 값 파일(`.env.development` 등)은 git 에서 제외되며, `.env.example` 만 추적합니다.

| 변수                | 설명                  |
| ------------------- | --------------------- |
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL |

## 향후 도입 예정 (확정 후)

- **shadcn/ui** — 컴포넌트 디자인 방향 확정 후 (`npx shadcn init`)
- **Tailwind theme** — 디자이너 디자인 토큰(색·폰트·간격) 확정 후 `tailwind.config.js`
- **지도 SDK** — 매체 선택 방식 확정 후 (Kakao Map 등)
