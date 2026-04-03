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

  if (Array.isArray(issues)) {
    return issues.join(', ')
  }

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

function useNotificationsData() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const issuesRef = ref(db, 'reported_issues')

    const unsubscribe = onValue(issuesRef, (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        setNotifications([])
        return
      }

      const formattedNotifications = Object.entries(data)
        .map(([issueId, issueData]) => {
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
          }
        })
        .sort((a, b) => b.reportedAt - a.reportedAt)

      setNotifications(formattedNotifications)
    })

    return () => unsubscribe()
  }, [])

  return notifications
}

export default useNotificationsData