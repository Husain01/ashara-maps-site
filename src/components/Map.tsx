"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { zones, Zone, calculateDistance } from "@/data/zones";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  userLocation?: [number, number];
  onZoneClick: (zone: Zone) => void;
}

interface ZoneWithDistance extends Zone {
  distance?: number;
}

function LocationMarker({ userLocation }: { userLocation: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 12);
    }
  }, [userLocation, map]);

  const userIcon = new L.Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return userLocation ? (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <strong>Your Location</strong>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function Map({ userLocation, onZoneClick }: MapProps) {
  const [zonesWithDistance, setZonesWithDistance] =
    useState<ZoneWithDistance[]>(zones);

  useEffect(() => {
    if (userLocation) {
      const zonesWithDist = zones.map((zone) => ({
        ...zone,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          zone.coordinates[0],
          zone.coordinates[1]
        ),
      }));

      // Sort by distance
      zonesWithDist.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setZonesWithDistance(zonesWithDist);
    }
  }, [userLocation]);

  // Create custom icons for zones
  const createZoneIcon = (isNear: boolean) => {
    const color = isNear ? "#10B981" : "#EF4444"; // Green for close, red for far
    return new L.Icon({
      iconUrl:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 40c0 0 16-10.5 16-24C32 7.163 24.837 0 16 0S0 7.163 0 16c0 13.5 16 24 16 24z" fill="${color}"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">Z</text>
        </svg>
      `),
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });
  };

  // Chennai center coordinates as default
  const defaultCenter: [number, number] = [13.0827, 80.2707];
  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 12 : 11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && <LocationMarker userLocation={userLocation} />}

        {zonesWithDistance.map((zone) => {
          const isNear = zone.distance ? zone.distance < 5 : false; // Within 5km

          return (
            <Marker
              key={zone.id}
              position={zone.coordinates}
              icon={createZoneIcon(isNear)}
              eventHandlers={{
                click: () => onZoneClick(zone),
              }}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{zone.location}</p>
                  {zone.distance && (
                    <p className="text-sm font-medium text-blue-600 mb-3">
                      {zone.distance.toFixed(1)} km away
                    </p>
                  )}
                  <button
                    onClick={() => onZoneClick(zone)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    🧭 Navigate
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
