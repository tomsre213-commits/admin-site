import { useState } from 'react'
import useHistoryData from '../data/historyData'
import useDashboardStats from '../data/dashboardStats'
import LiveMap from '../components/LiveMap'
import RouteMapModal from '../components/RouteMapModal'

function DashboardPage() {
  const historyData = useHistoryData()
  const stats = useDashboardStats()
  const [selectedRide, setSelectedRide] = useState(null)

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <h2>{stats.totalRides}</h2>
          <p>Total Rides</p>
        </div>

        <div className="stat-card">
          <h2>{stats.totalDistanceText}</h2>
          <p>Distance Generated</p>
        </div>

        <div className="stat-card">
          <h2>{stats.ridesToday}</h2>
          <p>Rides Today</p>
        </div>

        <div className="stat-card">
          <h2>{stats.maintenanceCount}</h2>
          <p>Maintenance</p>
        </div>
      </section>

      <section className="content-grid">
        <div className="left-column">
          <div className="section-card">
            <div className="section-header">
              <h2>Live Map</h2>
              <span>This Month</span>
            </div>
            <div className="map-box">
              <LiveMap />
            </div>
          </div>

          {/* <div className="section-card">
            <div className="section-header">
              <h2>User Analytics</h2>
              <span>Read More</span>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Users Overview</h3>
                <p>Female users and male users analytics summary.</p>
              </div>

              <div className="analytics-card highlight">
                <div className="circle">70%</div>
                <div>
                  <p>On average, 7 out of 10 users are</p>
                  <strong>Female</strong>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="right-column">
          <div className="section-card history-card">
            <div className="section-header">
              <h2>History</h2>
              <span>All</span>
            </div>

            <div className="history-table">
              <div className="history-head">
                <span>Account Name</span>
                <span>Device ID</span>
                <span>Date</span>
                <span>Distance</span>
              </div>

              <div className="history-body">
                {historyData.map((item) => (
                  <div
                    className="history-row history-row-clickable"
                    key={item.id}
                    onClick={() => setSelectedRide(item)}
                  >
                    <span>{item.account}</span>
                    <span>{item.device}</span>
                    <span>{item.date}</span>
                    <span className="distance">{item.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="show-all">Show All Transaction</div>
          </div>
        </div>
      </section>

      <RouteMapModal
        isOpen={!!selectedRide}
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
      />
    </>
  )
}

export default DashboardPage