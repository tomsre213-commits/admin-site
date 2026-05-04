function NotificationDetailsModal({ isOpen, notification, onClose }) {
  if (!isOpen || !notification) return null

  const issueEntries =
    notification.rawIssues && typeof notification.rawIssues === 'object'
      ? Object.entries(notification.rawIssues)
      : []

  const finalMessage =
    notification.notif === 'out'
      ? `🚨 Bike ${notification.bikeId} is OUT of the geofencing area`
      : notification.notif === 'in'
      ? `✅ Bike ${notification.bikeId} is inside the geofencing area`
      : notification.notif === 'not use'
      ? `ℹ️ Bike ${notification.bikeId} is currently not in use`
      : notification.message

  const titleColor =
    notification.notif === 'out'
      ? '#dc2626'
      : notification.notif === 'in'
      ? '#16a34a'
      : notification.notif === 'not use'
      ? '#6b7280'
      : '#111827'

  return (
    <div className="details-modal-overlay" onClick={onClose}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="details-modal-header">
          <div>
            <h2 style={{ color: titleColor }}>{notification.title}</h2>
            <p>{notification.type}</p>
          </div>

          <button className="details-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="details-modal-body">
          <div className="details-grid">
            <div><strong>Bike ID:</strong> {notification.bikeId}</div>
            <div><strong>Bike Name:</strong> {notification.bikeName}</div>
            <div><strong>Status:</strong> {notification.status}</div>
            <div><strong>Priority:</strong> {notification.priority}</div>
            <div><strong>Notif:</strong> {notification.notif || 'N/A'}</div>
            <div><strong>Date:</strong> {notification.date}</div>
            <div><strong>Time:</strong> {notification.time}</div>
            <div><strong>Reported By:</strong> {notification.reportedByEmail}</div>
            <div><strong>Location:</strong> {notification.location}</div>
          </div>

          <div className="details-section">
            <h3>Issue Message</h3>
            <div className="details-message-box">{finalMessage}</div>
          </div>

          {issueEntries.length > 0 && (
            <div className="details-section">
              <h3>Raw Issue Data</h3>
              <div className="details-issues-list">
                {issueEntries.map(([key, value]) => (
                  <div className="details-issue-row" key={key}>
                    <span className="details-issue-key">{key}</span>
                    <span className="details-issue-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationDetailsModal