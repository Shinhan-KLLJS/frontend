import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 로컬 전용 목업(src/_mock, gitignore) — 파일이 있으면 로드, 없으면(팀원·배포 빌드) 무시.
// 첫 API 요청 전에 인터셉터가 등록되도록 렌더 전에 await 한다.
async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === 'true') {
    const localMocks = import.meta.glob('./_mock/*.ts')
    await Promise.all(Object.values(localMocks).map((load) => load()))
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
