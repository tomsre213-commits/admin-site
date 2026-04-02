import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <Topbar title={activePage === 'dashboard' ? 'Dashboard' : 'Notifications'} />

        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'notifications' && <NotificationsPage />}
      </main>
    </div>
  )
}

export default App