import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto min-h-full max-w-content-lg p-x5 xl:max-w-content-xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
