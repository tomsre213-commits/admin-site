import { useState } from 'react'
import useHistoryData from '../data/historyData'
import useDashboardStats from '../data/dashboardStats'
import LiveMap from '../components/LiveMap'
import RouteMapModal from '../components/RouteMapModal'

function DashboardPage({ setActivePage }) {
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
        </div>

        <div className="right-column">
          <div className="section-card history-card">
            <div className="section-header">
              <h2>History</h2>
              <span>All</span>
            </div>

            <div className="dashboard-history-table">
              <div className="dashboard-history-head">
                <span className="col-account">Account Name</span>
                <span className="col-device">Device ID</span>
                <span className="col-date">Date</span>
                <span className="col-distance">Distance</span>
              </div>

              <div className="dashboard-history-body">
                {historyData.map((item) => (
                  <div
                    className="dashboard-history-row history-row-clickable"
                    key={item.id}
                    onClick={() => setSelectedRide(item)}
                  >
                    <span className="col-account">{item.account}</span>
                    <span className="col-device">{item.device}</span>
                    <span className="col-date">{item.date}</span>
                    <span className="col-distance distance">{item.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="show-all"
              onClick={() => setActivePage('history')}
            >
              Show All Transaction
            </div>
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