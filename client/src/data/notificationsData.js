import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

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
        // eslint-disable-next-line no-unused-vars
        .filter(([_, bikeData]) => bikeData.notif === 'out')
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
            location:
              bikeData.latitude && bikeData.longitude
                ? `${bikeData.latitude}, ${bikeData.longitude}`
                : 'Outside MSU-IIT',
            date,
            time,
            priority: 'High',
            status: 'pending',
            message: `🚨 ${bikeName} is out of the parameter or outside of MSU-IIT.`,
            reportedBy: 'System',
            reportedByEmail: 'System Geofence',
            reportedAt,
            rawIssues: {
              notif: bikeData.notif,
              latitude: bikeData.latitude,
              longitude: bikeData.longitude,
              padlock: bikeData.padlock,
              reserveUntil: bikeData.reserveUntil,
            },
            notif: bikeData.notif,
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