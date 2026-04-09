import { useState } from 'react'
import { ref, remove } from 'firebase/database'
import useHistoryData from '../data/historyData'
import RouteMapModal from '../components/RouteMapModal'
import { db } from '../firebase'
import { FaTrash } from 'react-icons/fa'

function AllHistoryPage({ setActivePage }) {
  const historyData = useHistoryData()
  const [selectedRide, setSelectedRide] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  const handleDelete = async (ride) => {
    const confirmDelete = window.confirm('Delete this ride history?')
    if (!confirmDelete) return

    try {
      setDeletingId(ride.id)

      await remove(
        ref(db, `users/${ride.userId}/history/${ride.historyId}`)
      )

      if (selectedRide?.id === ride.id) {
        setSelectedRide(null)
      }
    } catch (error) {
      console.error('Failed to delete history:', error)
      alert('Delete failed.')
    } finally {
      setDeletingId('')
    }
  }

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
          <span className="col-delete">Delete</span>
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

              <span className="col-delete">
                <button
                  className="delete-btn-red"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
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