'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Zone } from '@/data/zones'
import ZoneList from '@/components/ZoneList'
import { Map as MapIcon, List, Wifi, WifiOff, MapPin, Navigation } from 'lucide-react'

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>()
  const [locationError, setLocationError] = useState<string>('')
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false)
  const [isMapView, setIsMapView] = useState(true)
  const [isOffline, setIsOffline] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  useEffect(() => {
    // Check if we're offline
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const requestLocation = async () => {
    setLocationPermissionAsked(true)
    setIsLoadingLocation(true)
    setLocationError('')
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.')
      setIsLoadingLocation(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes
          }
        )
      })

      setUserLocation([position.coords.latitude, position.coords.longitude])
      setLocationError('')
    } catch (error: any) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError('Location access denied. You can still view all zones.')
          break
        case error.POSITION_UNAVAILABLE:
          setLocationError('Location information unavailable. Please try again.')
          break
        case error.TIMEOUT:
          setLocationError('Location request timed out. Please try again.')
          break
        default:
          setLocationError('Unable to get location. Please try again.')
          break
      }
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleZoneClick = (zone: Zone) => {
    // Open Google Maps for navigation
    window.open(zone.googleMapsUrl, '_blank', 'noopener,noreferrer')
  }

  const toggleView = () => {
    setIsMapView(!isMapView)
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Ashara Maps</h1>
              <p className="text-blue-100 text-sm">Zone Navigator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOffline ? (
              <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                <WifiOff className="h-3 w-3" />
                Offline
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-200">
                <Wifi className="h-4 w-4" />
              </div>
            )}
            
            <button
              onClick={toggleView}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
            >
              {isMapView ? (
                <>
                  <List className="h-4 w-4" />
                  List
                </>
              ) : (
                <>
                  <MapIcon className="h-4 w-4" />
                  Map
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Location Permission Banner */}
      {!locationPermissionAsked && !userLocation && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Enable location</strong> to see distances and get the best route to zones.
              </p>
            </div>
            <button
              onClick={requestLocation}
              disabled={isLoadingLocation}
              className="ml-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
            >
              {isLoadingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Getting...
                </>
              ) : (
                'Enable'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Location Error Banner */}
      {locationError && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800 flex-1">{locationError}</p>
            <button
              onClick={requestLocation}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* User Location Status */}
      {userLocation && (
        <div className="bg-green-50 border-b border-green-200 p-2">
          <p className="text-sm text-green-800 text-center flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            Location detected • Zones sorted by distance
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {isMapView ? (
          <Map userLocation={userLocation} onZoneClick={handleZoneClick} />
        ) : (
          <ZoneList userLocation={userLocation} onZoneClick={handleZoneClick} />
        )}
      </main>

      {/* Bottom Info */}
      <footer className="bg-gray-50 border-t p-3">
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Tap any zone to open navigation in Google Maps
          </p>
          {isOffline && (
            <p className="text-xs text-orange-600 mt-1">
              Running offline • Map tiles may be limited
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}
