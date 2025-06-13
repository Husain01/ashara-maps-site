"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Zone } from "@/data/zones";
import ZoneList from "@/components/ZoneList";
import {
  Map as MapIcon,
  List,
  Wifi,
  WifiOff,
  MapPin,
  Navigation,
  Download,
  X,
} from "lucide-react";

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

// PWA Install interface
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<
    [number, number] | undefined
  >();
  const [locationError, setLocationError] = useState<string>("");
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [isMapView, setIsMapView] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if we're offline
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isWebkit =
        (window.navigator as { standalone?: boolean }).standalone === true;
      setIsAppInstalled(isStandalone || isWebkit);
    };

    checkInstallStatus();

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isAppInstalled) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isAppInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const requestLocation = async () => {
    setLocationPermissionAsked(true);
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
      return;
    }

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
            "Location access denied. You can still view all zones."
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

  const handleZoneClick = (zone: Zone) => {
    // Open Google Maps for navigation
    window.open(zone.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="bg-blue-600 text-white p-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Download className="h-5 w-5" />
              <p className="text-sm">
                Install Ashara Maps for offline access and better performance!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Install button (permanent) */}
            {isAppInstalled ? (
              <div
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                title="App is installed"
              >
                <Download className="h-3 w-3" />
                Installed
              </div>
            ) : (
              <button
                onClick={
                  deferredPrompt
                    ? handleInstallClick
                    : () => {
                        // For browsers that don't support beforeinstallprompt
                        alert(
                          'To install: Use your browser\'s "Add to Home Screen" or "Install App" option in the menu.'
                        );
                      }
                }
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                title="Install app for offline use"
              >
                <Download className="h-3 w-3" />
                Install
              </button>
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
                <strong>Enable location</strong> to see distances and get the
                best route to zones.
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
                "Enable"
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
        <div className="bg-green-50 border-b border-green-200 p-2 animate-in slide-in-from-top duration-300">
          <p className="text-sm text-green-800 text-center flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            Location detected • Zones sorted by distance
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {isLoadingLocation && (
          <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Getting your location...</p>
            </div>
          </div>
        )}
        <div className="h-full transition-all duration-300 ease-in-out">
          {isMapView ? (
            <Map userLocation={userLocation} onZoneClick={handleZoneClick} />
          ) : (
            <ZoneList
              userLocation={userLocation}
              onZoneClick={handleZoneClick}
            />
          )}
        </div>
      </main>

      {/* Bottom Info */}
      <footer className="bg-gray-50 border-t p-3">
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Tap any zone to open navigation in Google Maps
          </p>
          {isOffline ? (
            <p className="text-xs text-orange-600 mt-1">
              Running offline • Map tiles may be limited
            </p>
          ) : isAppInstalled ? (
            <p className="text-xs text-green-600 mt-1">
              ✓ App installed • Full offline functionality available
            </p>
          ) : deferredPrompt ? (
            <p className="text-xs text-blue-600 mt-1">
              💡 Install this app for offline access •
              <button
                onClick={handleInstallClick}
                className="underline hover:text-blue-800 ml-1"
              >
                Install now
              </button>
            </p>
          ) : (
            <p className="text-xs text-green-600 mt-1">
              ✓ App ready for offline use
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
