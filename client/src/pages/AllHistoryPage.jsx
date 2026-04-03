import useHistoryData from '../data/historyData'
import { useState } from 'react'
import RouteMapModal from '../components/RouteMapModal'

function AllHistoryPage({ setActivePage }) {
  const historyData = useHistoryData()
  const [selectedRide, setSelectedRide] = useState(null)

  return (
    <div className="page-container">
      
      <div className="page-header">
        <h1>History</h1>
        <button
          className="close-btn"
          onClick={() => setActivePage('dashboard')}
        >
          ✕
        </button>
      </div>

      <div className="history-table full">
        <div className="history-head">
          <span className="col-account">Account Name</span>
          <span className="col-device">Device ID</span>
          <span className="col-date">Date</span>
          <span className="col-distance">Distance</span>
          <span className="col-action">View Map</span>
        </div>

        <div className="history-body">
          {historyData.map((item) => (
            <div className="history-row" key={item.id}>
              <span className="col-account">{item.account}</span>
              <span className="col-device">{item.device}</span>
              <span className="col-date">{item.date}</span>
              <span className="col-distance distance">{item.distance}</span>

              <span className="col-action">
                <button
                  className="view-map-btn"
                  onClick={() => setSelectedRide(item)}
                >
                  View
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <RouteMapModal
        isOpen={!!selectedRide}
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
      />
    </div>
  )
}

export default AllHistoryPage