import { useEffect, useMemo, useState } from 'react'
import { GoogleMap, useJsApiLoader, Polygon, Marker } from '@react-google-maps/api'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 8.2419,
  lng: 124.2438,
}

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

function LiveMap() {
  const [bikes, setBikes] = useState([])
  const [selectedBike, setSelectedBike] = useState(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  useEffect(() => {
    const bikesRef = ref(db, 'bikes')

    const unsubscribe = onValue(bikesRef, (snapshot) => {
      const data = snapshot.val()

      if (!data) {
        setBikes([])
        return
      }

      const formattedBikes = Object.entries(data)
        .map(([key, value]) => {
          const lat = Number(value.latitude)
          const lng = Number(value.longitude)

          if (Number.isNaN(lat) || Number.isNaN(lng)) return null

          return {
            id: key,
            name: key.toUpperCase(),
            lat,
            lng,
            padlock: value.padlock || 'locked',
          }
        })
        .filter(Boolean)

      setBikes(formattedBikes)
    })

    return () => unsubscribe()
  }, [])

  const mapCenter = useMemo(() => {
    if (selectedBike) {
      return { lat: selectedBike.lat, lng: selectedBike.lng }
    }

    if (bikes.length > 0) {
      return { lat: bikes[0].lat, lng: bikes[0].lng }
    }

    return defaultCenter
  }, [bikes, selectedBike])

  if (loadError) {
    return <div className="map-status">Failed to load Google Map.</div>
  }

  if (!isLoaded) {
    return <div className="map-status">Loading map...</div>
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={18}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      <Polygon
        paths={msuIitPolygon}
        options={{
          strokeColor: '#32CD32',
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: '#32CD32',
          fillOpacity: 0.27,
        }}
      />

      {bikes.map((bike) => (
        <Marker
          key={bike.id}
          position={{ lat: bike.lat, lng: bike.lng }}
          title={`${bike.name} - ${bike.padlock}`}
          onClick={() => setSelectedBike(bike)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8, // size of circle
            fillColor:
                bike.padlock === 'unlocked'
                ? '#ff3b30' // red
                : bike.padlock === 'reserve'
                ? '#007bff' // blue
                : '#28a745', // greenx`x`
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            }}
        />
      ))}
    </GoogleMap>
  )
}

export default LiveMap