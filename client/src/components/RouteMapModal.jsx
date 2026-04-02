import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%',
}

function RouteMapModal({ isOpen, onClose, ride }) {
  if (!isOpen || !ride) return null

  const routePath = ride.route || []

  const center =
    routePath.length > 0
      ? routePath[Math.floor(routePath.length / 2)]
      : { lat: 8.2419, lng: 124.2438 }

  const startMarker = routePath[0]
  const endMarker = routePath[routePath.length - 1]

  return (
    <div className="route-modal-overlay" onClick={onClose}>
      <div className="route-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="route-modal-header">
          <h2>Ride Route</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="route-modal-body">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={18}
          >
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#2d6cdf',
                strokeWeight: 5,
              }}
            />

            {startMarker && (
              <Marker position={startMarker} label="S" />
            )}

            {endMarker && (
              <Marker position={endMarker} label="E" />
            )}
          </GoogleMap>
        </div>

      </div>
    </div>
  )
}

export default RouteMapModal