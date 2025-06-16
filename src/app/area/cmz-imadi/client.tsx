"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { cmzImadiAreaConfig } from "@/data/areaDetails";
import { WifiOff, MapPin, Loader2 } from "lucide-react";

// Dynamically import DetailedAreaMap to avoid SSR issues with Leaflet
const DetailedAreaMap = dynamic(() => import("@/components/DetailedAreaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          Loading detailed area map...
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Preparing street-level navigation
        </p>
      </div>
    </div>
  ),
});

export default function CMZImadiClient() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<
    [number, number] | undefined
  >();
  const [isOnline, setIsOnline] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-request location on mount with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (navigator.geolocation && !locationPermissionAsked) {
        getUserLocation();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [locationPermissionAsked]);

  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");
    setLocationPermissionAsked(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      setUserLocation([position.coords.latitude, position.coords.longitude]);
      setLocationError("");
    } catch (error: unknown) {
      const geoError = error as GeolocationPositionError;
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setLocationError(
            "Location access denied. You can still navigate to all facilities."
          );
          break;
        case geoError.POSITION_UNAVAILABLE:
          setLocationError(
            "Location information unavailable. Please try again."
          );
          break;
        case geoError.TIMEOUT:
          setLocationError("Location request timed out. Please try again.");
          break;
        default:
          setLocationError("Unable to get location. Please try again.");
          break;
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Minimal Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg relative z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">CMZ - Imadi Area</h1>
              <p className="text-blue-100 text-sm">
                Street-level navigation •{" "}
                {cmzImadiAreaConfig.facilities.length + 2} locations
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <div
                  className="bg-red-500 bg-opacity-20 rounded-full p-2"
                  title="Offline"
                >
                  <WifiOff className="h-4 w-4 text-red-200" />
                </div>
              )}
              {userLocation && (
                <div
                  className="bg-green-500 bg-opacity-20 rounded-full p-2"
                  title="Location detected"
                >
                  <MapPin className="h-4 w-4 text-green-200" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status Banners */}
      {isLoadingLocation && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              Getting your location for accurate distances...
            </span>
          </div>
        </div>
      )}

      {locationError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-800 flex-1">{locationError}</p>
            <button
              onClick={getUserLocation}
              className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {userLocation && !isLoadingLocation && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <p className="text-sm text-green-800 text-center flex items-center justify-center gap-2">
            <MapPin className="h-3 w-3" />
            Location detected • Walking times and distances calculated
          </p>
        </div>
      )}

      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <p className="text-sm text-red-800 text-center">
            You&apos;re offline. Some navigation features may be limited.
          </p>
        </div>
      )}

      {/* Permission Request Banner */}
      {!locationPermissionAsked && !userLocation && !isLoadingLocation && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Enable location</strong> to see walking times and
                distances to facilities.
              </p>
            </div>
            <button
              onClick={getUserLocation}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Main Map Content */}
      <main className="flex-1 overflow-hidden relative">
        <DetailedAreaMap
          areaConfig={cmzImadiAreaConfig}
          userLocation={userLocation}
          onBackClick={handleBackClick}
        />
      </main>
    </div>
  );
}
