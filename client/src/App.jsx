import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import AllHistoryPage from './pages/AllHistoryPage'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const getPageTitle = () => {
    if (activePage === 'dashboard') return 'Dashboard'
    if (activePage === 'notifications') return 'Notifications'
    if (activePage === 'history') return 'Dashboard'
    return 'Dashboard'
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <Topbar title={getPageTitle()} />

        {activePage === 'dashboard' && (
          <DashboardPage setActivePage={setActivePage} />
        )}

        {activePage === 'notifications' && <NotificationsPage />}

        {activePage === 'history' && (
          <AllHistoryPage setActivePage={setActivePage} />
        )}
      </main>
    </div>
  )
}

export default App