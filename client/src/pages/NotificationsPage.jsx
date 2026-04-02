import { useMemo, useState } from 'react'
import { ref, remove, update } from 'firebase/database'
import useNotificationsData from '../data/notificationsData'
import { db } from '../firebase'
import NotificationDetailsModal from '../components/NotificationDetailsModal'

function NotificationsPage() {
  const notifications = useNotificationsData()
  const [filter, setFilter] = useState('all')
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [loadingId, setLoadingId] = useState('')

  const filteredNotifications = useMemo(() => {
    if (filter === 'pending') {
      return notifications.filter(
        (item) => item.status.toLowerCase() === 'pending'
      )
    }

    if (filter === 'resolved') {
      return notifications.filter(
        (item) => item.status.toLowerCase() === 'resolved'
      )
    }

    if (filter === 'high') {
      return notifications.filter(
        (item) => item.priority.toLowerCase() === 'high'
      )
    }

    return notifications
  }, [notifications, filter])

  const totalReports = notifications.length
  const pendingCount = notifications.filter(
    (item) => item.status.toLowerCase() === 'pending'
  ).length
  const highPriorityCount = notifications.filter(
    (item) => item.priority.toLowerCase() === 'high'
  ).length

  const handleResolve = async (id) => {
    try {
      setLoadingId(id)
      await update(ref(db, `reported_issues/${id}`), {
        status: 'resolved',
      })
    } catch (error) {
      console.error('Failed to resolve issue:', error)
      alert('Failed to mark as resolved.')
    } finally {
      setLoadingId('')
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this report?')
    if (!confirmed) return

    try {
      setLoadingId(id)
      await remove(ref(db, `reported_issues/${id}`))

      if (selectedNotification?.id === id) {
        setSelectedNotification(null)
      }
    } catch (error) {
      console.error('Failed to delete issue:', error)
      alert('Failed to delete report.')
    } finally {
      setLoadingId('')
    }
  }

  return (
    <section className="notifications-page">
      <div className="page-tools">
        <div className="notification-summary">
          <div className="summary-card">
            <h3>{totalReports}</h3>
            <p>Total Reports</p>
          </div>

          <div className="summary-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="summary-card">
            <h3>{highPriorityCount}</h3>
            <p>High Priority</p>
          </div>
        </div>

        <div className="sort-filter">
          <span>Sort by</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      <div className="notification-list">
        {filteredNotifications.length === 0 && (
          <div className="notification-card">
            <div className="notification-header">
              <div>
                <h3>No notifications found</h3>
                <p className="notification-type">
                  No matching issue reports in Firebase.
                </p>
              </div>
            </div>
          </div>
        )}

        {filteredNotifications.map((item) => (
          <div className="notification-card" key={item.id}>
            <div className="notification-header">
              <div>
                <h3>{item.title}</h3>
                <p className="notification-type">{item.type}</p>
              </div>

              <div className="notification-badges">
                <span className={`priority-badge ${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="notification-details">
              <div><strong>Bike ID:</strong> {item.bikeId}</div>
              <div><strong>Location:</strong> {item.location}</div>
              <div><strong>Date:</strong> {item.date}</div>
              <div><strong>Time:</strong> {item.time}</div>
              <div><strong>Reported By:</strong> {item.reportedByEmail}</div>
              <div><strong>Bike Name:</strong> {item.bikeName}</div>
            </div>

            <p className="notification-message">{item.message}</p>

            <div className="notification-actions">
              <button
                className="btn view-btn"
                onClick={() => setSelectedNotification(item)}
              >
                View Details
              </button>

              <button
                className="btn resolve-btn"
                onClick={() => handleResolve(item.id)}
                disabled={loadingId === item.id || item.status.toLowerCase() === 'resolved'}
              >
                {item.status.toLowerCase() === 'resolved'
                  ? 'Resolved'
                  : loadingId === item.id
                  ? 'Updating...'
                  : 'Mark as Resolved'}
              </button>

              <button
                className="btn delete-btn"
                onClick={() => handleDelete(item.id)}
                disabled={loadingId === item.id}
              >
                {loadingId === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <NotificationDetailsModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </section>
  )
}

export default NotificationsPage