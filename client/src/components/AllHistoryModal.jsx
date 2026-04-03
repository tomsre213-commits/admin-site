function AllHistoryModal({ isOpen, onClose, historyData }) {
  if (!isOpen) return null

  return (
    <div className="all-history-overlay" onClick={onClose}>
      <div
        className="all-history-modal exact-history-look"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="all-history-header">
          <h2>History</h2>
          <button
            className="all-history-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="all-history-table">
          <div className="all-history-head">
            <span>Transaction ID</span>
            <span>Device ID</span>
            <span>Date</span>
            <span>Distance</span>
          </div>

          <div className="all-history-body">
            {historyData.length === 0 ? (
              <div className="all-history-empty">No transaction history found.</div>
            ) : (
              historyData.map((item) => (
                <div className="all-history-row" key={item.id}>
                  <span>{item.id}</span>
                  <span>{item.device}</span>
                  <span>{item.date}</span>
                  <span className="distance">{item.distance}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllHistoryModal