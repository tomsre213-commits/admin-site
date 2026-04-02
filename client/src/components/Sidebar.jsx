import logo from '../assets/logo.png'

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logo} alt="tindak logo" className="logo-img" />
        <span className="logo-text">tindak</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          Dashboard
        </button>

        <button
          className={`menu-item ${activePage === 'notifications' ? 'active' : ''}`}
          onClick={() => setActivePage('notifications')}
        >
          Notifications
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar