import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

const msuIitPolygon = [
  { lat: 8.2440, lng: 124.2430 },
  { lat: 8.2440, lng: 124.2431 },
  { lat: 8.2437, lng: 124.2433 },
  { lat: 8.2435, lng: 124.2433 },
  { lat: 8.2430, lng: 124.2439 },
  { lat: 8.2432, lng: 124.2441 },
  { lat: 8.2431, lng: 124.2442 },
  { lat: 8.2431, lng: 124.2443 },
  { lat: 8.2431, lng: 124.2444 },
  { lat: 8.2431, lng: 124.2445 },
  { lat: 8.2422, lng: 124.2443 },
  { lat: 8.2419, lng: 124.2449 },
  { lat: 8.2401, lng: 124.2446 },
  { lat: 8.2399, lng: 124.2448 },
  { lat: 8.2399, lng: 124.2449 },
  { lat: 8.2394, lng: 124.2445 },
  { lat: 8.2391, lng: 124.2443 },
  { lat: 8.2394, lng: 124.2434 },
  { lat: 8.2395, lng: 124.2430 },
  { lat: 8.2400, lng: 124.2430 },
  { lat: 8.2399, lng: 124.2428 },
  { lat: 8.2400, lng: 124.2426 },
  { lat: 8.2407, lng: 124.2427 },
  { lat: 8.2410, lng: 124.2430 },
  { lat: 8.2418, lng: 124.2432 },
  { lat: 8.2418, lng: 124.2430 },
  { lat: 8.2422, lng: 124.2430 },
  { lat: 8.2423, lng: 124.2426 },
  { lat: 8.2423, lng: 124.2421 },
  { lat: 8.2430, lng: 124.2422 },
  { lat: 8.2430, lng: 124.2424 },
  { lat: 8.2435, lng: 124.2426 },
]

function isPointInsidePolygon(point, polygon) {
  let inside = false
  let j = polygon.length - 1

  for (let i = 0; i < polygon.length; i++) {
    const xi = polygon[i].lat
    const yi = polygon[i].lng
    const xj = polygon[j].lat
    const yj = polygon[j].lng

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
    j = i
  }

  return inside
}

function formatDateTime(timestamp) {
  if (!timestamp) {
    return {
      date: 'N/A',
      time: 'N/A',
    }
  }

  const dateObj = new Date(Number(timestamp))

  return {
    date: dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }
}

function extractIssueMessage(issues) {
  if (!issues) return 'No issue details provided.'
  if (typeof issues === 'string') return issues
  if (Array.isArray(issues)) return issues.join(', ')

  if (typeof issues === 'object') {
    const values = Object.values(issues)
      .map((value) => String(value))
      .filter(Boolean)

    return values.length > 0
      ? values.join(', ')
      : 'No issue details provided.'
  }

  return 'No issue details provided.'
}

function getPriorityFromIssues(message) {
  const text = message.toLowerCase()

  if (
    text.includes('brake') ||
    text.includes('accident') ||
    text.includes('danger') ||
    text.includes('emergency') ||
    text.includes('lock') ||
    text.includes('padlock')
  ) {
    return 'High'
  }

  if (
    text.includes('battery') ||
    text.includes('tire') ||
    text.includes('wheel') ||
    text.includes('chain')
  ) {
    return 'Medium'
  }

  return 'Low'
}

function getTypeFromIssues(message) {
  const text = message.toLowerCase()

  if (text.includes('battery')) return 'Battery Alert'
  if (text.includes('brake')) return 'Maintenance'
  if (text.includes('lock') || text.includes('padlock')) return 'Lock Issue'
  if (text.includes('route') || text.includes('location')) return 'Location Alert'

  return 'User Report'
}

function getBikeDisplayName(bikeId) {
  if (!bikeId) return 'Bike'

  const number = String(bikeId).replace('bike', '').padStart(3, '0')
  return `Bike ${number}`
}

function useNotificationsData() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const issuesRef = ref(db, 'reported_issues')
    const bikesRef = ref(db, 'bikes')

    let issueNotifications = []
    let geofenceNotifications = []

    const updateNotifications = () => {
      const combined = [
        ...geofenceNotifications,
        ...issueNotifications,
      ].sort((a, b) => b.reportedAt - a.reportedAt)

      setNotifications(combined)
    }

    const unsubscribeIssues = onValue(issuesRef, (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        issueNotifications = []
        updateNotifications()
        return
      }

      issueNotifications = Object.entries(data).map(([issueId, issueData]) => {
        const message = extractIssueMessage(issueData.issues)
        const { date, time } = formatDateTime(issueData.reportedAt)

        return {
          id: issueId,
          title: `${issueData.bikeName || issueData.bikeId || 'Bike'} reported issue`,
          type: getTypeFromIssues(message),
          bikeId: issueData.bikeId || 'N/A',
          bikeName: issueData.bikeName || issueData.bikeId || 'N/A',
          location: issueData.location || 'Location not provided',
          date,
          time,
          priority: getPriorityFromIssues(message),
          status: issueData.status || 'pending',
          message,
          reportedBy: issueData.reportedBy || '',
          reportedByEmail: issueData.reportedByEmail || 'Unknown user',
          reportedAt: Number(issueData.reportedAt || 0),
          rawIssues: issueData.issues || null,
          notif: issueData.notif || '',
        }
      })

      updateNotifications()
    })

    const unsubscribeBikes = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        geofenceNotifications = []
        updateNotifications()
        return
      }

      geofenceNotifications = Object.entries(data)
        .filter(([_, bikeData]) => {
          const lat = Number(bikeData.latitude)
          const lng = Number(bikeData.longitude)

          if (!lat || !lng) return false

          const isInside = isPointInsidePolygon(
            { lat, lng },
            msuIitPolygon
          )

          return !isInside
        })
        .map(([bikeKey, bikeData]) => {
          const bikeId = bikeData.bikeId || bikeKey
          const bikeName = getBikeDisplayName(bikeId)
          const reportedAt = Number(bikeData.timestamp || Date.now())
          const { date, time } = formatDateTime(reportedAt)

          return {
            id: `geofence-${bikeKey}`,
            title: `${bikeName} is outside MSU-IIT`,
            type: 'Geofence Alert',
            bikeId,
            bikeName,
            location: `${bikeData.latitude}, ${bikeData.longitude}`,
            date,
            time,
            priority: 'High',
            status: 'pending',
            message: `${bikeName} is out of the parameter or outside of MSU-IIT.`,
            reportedBy: 'System',
            reportedByEmail: 'System Geofence',
            reportedAt,
            rawIssues: {
              notif: 'out',
              latitude: bikeData.latitude,
              longitude: bikeData.longitude,
              padlock: bikeData.padlock,
              reserveUntil: bikeData.reserveUntil,
            },
            notif: 'out',
          }
        })

      updateNotifications()
    })

    return () => {
      unsubscribeIssues()
      unsubscribeBikes()
    }
  }, [])

  return notifications
}

export default useNotificationsData