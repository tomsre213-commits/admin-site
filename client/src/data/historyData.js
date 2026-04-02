import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

function useHistoryData() {
  const [historyData, setHistoryData] = useState([])

  useEffect(() => {
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        setHistoryData([])
        return
      }

      const allHistory = []

      Object.entries(data).forEach(([userId, userData]) => {
        const accountName = userData.email || 'Unknown User'

        if (userData.history) {
          Object.entries(userData.history).forEach(([historyId, ride]) => {
            const routePoints = ride.route
              ? Object.values(ride.route)
                  .map((point) => ({
                    lat: Number(point.latitude),
                    lng: Number(point.longitude),
                    timestamp: point.timestamp || 0,
                  }))
                  .filter(
                    (point) =>
                      !Number.isNaN(point.lat) && !Number.isNaN(point.lng)
                  )
                  .sort((a, b) => a.timestamp - b.timestamp)
              : []

            allHistory.push({
              id: historyId,
              historyId,
              userId,
              account: accountName,
              device: ride.bikeId || 'N/A',
              date: ride.endPoint?.endedAtText || ride.endedAtText || 'N/A',
              distance: ride.distanceText || '0 m',
              distanceMeters: ride.distanceMeters || 0,
              startedAt: ride.startedAt || 0,
              endedAt: ride.endPoint?.endedAt || ride.endedAt || 0,
              route: routePoints,
              startPoint: ride.startPoint || null,
              endPoint: ride.endPoint || null,
            })
          })
        }
      })

      allHistory.sort((a, b) => b.startedAt - a.startedAt)
      setHistoryData(allHistory)
    })

    return () => unsubscribe()
  }, [])

  return historyData
}

export default useHistoryData