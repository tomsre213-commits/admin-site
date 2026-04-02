import profile from '../assets/profile.jpg';

function Topbar({ title }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>

      <div className="topbar-right">
        <div className="search-box">
          <input type="text" placeholder="Search here" />
        </div>

        <div className="profile-card">
          <div>
            <h3>Aijeen Pearl Cuervo</h3>
            <span>Head of Administrator</span>
          </div>
          <img
            src={profile}
            alt="profile"
          />
        </div>
      </div>
    </header>
  )
}

export default Topbar