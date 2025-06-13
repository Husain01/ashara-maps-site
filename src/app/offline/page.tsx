"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, MapPin, Navigation } from "lucide-react";
import { zones } from "@/data/zones";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
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

  const handleRetry = () => {
    if (isOnline) {
      window.location.href = "/";
    }
  };

  const handleZoneClick = (zone: (typeof zones)[0]) => {
    // Even offline, we can still try to open Google Maps
    window.open(zone.googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Navigation className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Ashara Maps</h1>
            <p className="text-blue-100 text-sm">Offline Mode</p>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div
        className={`p-4 ${
          isOnline
            ? "bg-green-50 border-green-200"
            : "bg-orange-50 border-orange-200"
        } border-b`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff
              className={`h-5 w-5 ${
                isOnline ? "text-green-600" : "text-orange-600"
              }`}
            />
            <p
              className={`text-sm ${
                isOnline ? "text-green-800" : "text-orange-800"
              }`}
            >
              {isOnline ? "Connection restored!" : "You are currently offline"}
            </p>
          </div>
          {isOnline && (
            <button
              onClick={handleRetry}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Reload App
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Offline Mode
            </h2>
            <p className="text-gray-600">
              You can still view zone information and get navigation links even
              while offline.
            </p>
          </div>

          {/* Offline Zone List */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Zones
            </h3>
            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className="w-full text-left p-3 bg-white rounded-md hover:bg-blue-50 transition-colors border"
                >
                  <div className="font-medium text-gray-900">{zone.name}</div>
                  <div className="text-sm text-gray-600">{zone.location}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Tap to open Google Maps
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Retry Section */}
          <div className="text-center">
            <button
              onClick={handleRetry}
              disabled={!isOnline}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              {isOnline ? "Return to App" : "Waiting for connection..."}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              The app will work normally once you&apos;re back online
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
