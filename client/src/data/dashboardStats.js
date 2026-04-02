import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

function isTodayFromTimestamp(timestamp) {
  if (!timestamp) return false

  const date = new Date(Number(timestamp))
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function useDashboardStats() {
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistanceMeters: 0,
    totalDistanceText: '0 m',
    ridesToday: 0,
    maintenanceCount: 0,
  })

  useEffect(() => {
    const usersRef = ref(db, 'users')
    const issuesRef = ref(db, 'reported_issues')

    let usersDataCache = null
    let issuesDataCache = null

    const recompute = () => {
      let totalRides = 0
      let totalDistanceMeters = 0
      let ridesToday = 0

      if (usersDataCache) {
        Object.values(usersDataCache).forEach((userData) => {
          if (!userData?.history) return

          Object.values(userData.history).forEach((ride) => {
            totalRides += 1

            const distanceMeters = Number(ride.distanceMeters || 0)
            totalDistanceMeters += distanceMeters

            const endedAt =
              ride?.endPoint?.endedAt ||
              ride?.endedAt ||
              0

            if (isTodayFromTimestamp(endedAt)) {
              ridesToday += 1
            }
          })
        })
      }

      let maintenanceCount = 0

      if (issuesDataCache) {
        maintenanceCount = Object.keys(issuesDataCache).length
      }

      setStats({
        totalRides,
        totalDistanceMeters,
        totalDistanceText: formatDistance(totalDistanceMeters),
        ridesToday,
        maintenanceCount,
      })
    }

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      usersDataCache = snapshot.val()
      recompute()
    })

    const unsubscribeIssues = onValue(issuesRef, (snapshot) => {
      issuesDataCache = snapshot.val()
      recompute()
    })

    return () => {
      unsubscribeUsers()
      unsubscribeIssues()
    }
  }, [])

  return stats
}

export default useDashboardStats