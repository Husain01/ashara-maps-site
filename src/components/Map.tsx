"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  zones,
  Zone,
  calculateDistance,
  POI,
  POI_CATEGORIES,
  getAllPOIs,
} from "@/data/zones";
import {
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Crosshair,
  Navigation,
  Filter,
  X,
} from "lucide-react";
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
      // Set view with animation
      map.setView(userLocation, 14, { animate: true });
    }
  }, [userLocation, map]);

  // Create a more prominent user location icon with pulsing effect
  const userIcon = new L.DivIcon({
    html: `
      <div style="position: relative;">
        <!-- Pulsing circle -->
        <div style="
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          position: absolute;
          top: -4px;
          left: -4px;
          animation: pulse 2s infinite;
        "></div>
        <!-- Main location dot -->
        <svg width="24" height="24" viewBox="0 0 24 24" style="position: relative; z-index: 1;">
          <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      </style>
    `,
    className: "user-location-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return userLocation ? (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <strong>Your Location</strong>
          </div>
          <p className="text-sm text-gray-600">
            Latitude: {userLocation[0].toFixed(6)}
          </p>
          <p className="text-sm text-gray-600">
            Longitude: {userLocation[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Component to handle map ready event
function MapReady({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

// Unique colors for each zone
const zoneColors: { [key: string]: string } = {
  "saifee-masjid-cmz": "#10B981", // Green
  "imadi-zone": "#F59E0B", // Amber
  "hakimi-zone": "#EF4444", // Red
  "fakhri-zone": "#8B5CF6", // Purple
  "burhani-zone": "#06B6D4", // Cyan
  "mohammadi-zone": "#F97316", // Orange
  "ezzi-zone": "#84CC16", // Lime
  "vajihi-zone": "#EC4899", // Pink
  "najmi-zone": "#6366F1", // Indigo
  "taheri-zone": "#14B8A6", // Teal
};

// Function to get zone color based on zone ID
function getZoneColor(zoneId: string): string {
  return zoneColors[zoneId] || "#6B7280"; // Default gray if zone not found
}

export default function Map({ userLocation, onZoneClick }: MapProps) {
  const [zonesWithDistance, setZonesWithDistance] =
    useState<ZoneWithDistance[]>(zones);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPOICategories, setSelectedPOICategories] = useState<
    Set<POI["category"]>
  >(new Set());
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

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

  // Handle legend zone click - navigate to zone on map
  const handleLegendZoneClick = (zone: Zone) => {
    if (mapRef.current) {
      // Pan to the zone
      mapRef.current.setView(zone.coordinates, 15, { animate: true });

      // Open the marker popup
      const marker = markersRef.current[zone.id];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500); // Small delay to allow pan animation
      }
    }

    // Close the legend
    setIsLegendOpen(false);
  };

  // Handle map ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

  // Handle marker ready
  const handleMarkerReady = (marker: L.Marker, zoneId: string) => {
    markersRef.current[zoneId] = marker;
  };

  // Handle POI category filter toggle
  const togglePOICategory = (category: POI["category"]) => {
    setSelectedPOICategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Get filtered POIs to display
  const getFilteredPOIs = (): POI[] => {
    if (selectedPOICategories.size === 0) return [];
    return getAllPOIs().filter((poi) =>
      selectedPOICategories.has(poi.category)
    );
  };

  // Create POI marker icon
  const createPOIIcon = (poi: POI) => {
    const category = POI_CATEGORIES[poi.category];
    return new L.DivIcon({
      html: `
        <div style="
          background: ${category.color};
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${category.icon}
        </div>
      `,
      className: "custom-poi-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Create custom icons for zones with labels
  const createZoneIcon = (zone: ZoneWithDistance) => {
    const color = getZoneColor(zone.id);
    const zoneName = zone.name.replace(" Zone", "").replace(" - CMZ", "");

    return new L.DivIcon({
      html: `
        <div style="position: relative; text-align: center;">
          <svg width="36" height="45" viewBox="0 0 36 45" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));">
            <path d="M18 45c0 0 18-12 18-27C36 8.059 27.941 0 18 0S0 8.059 0 18c0 15 18 27 18 27z" fill="${color}"/>
            <circle cx="18" cy="18" r="10" fill="white"/>
            <circle cx="18" cy="18" r="6" fill="${color}"/>
          </svg>
          <div style="
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            color: #374151;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            border: 1px solid rgba(0,0,0,0.1);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          ">
            ${zoneName}
          </div>
        </div>
      `,
      className: "custom-zone-marker",
      iconSize: [36, 70], // Increased height to accommodate label
      iconAnchor: [18, 45],
    });
  };

  // Chennai center coordinates as default
  const defaultCenter: [number, number] = [13.0827, 80.2707];
  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="h-full w-full relative">
      {/* POI Filter */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">POIs</span>
          {selectedPOICategories.size > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {selectedPOICategories.size}
            </span>
          )}
        </button>

        {/* POI Filter Dropdown */}
        {isFilterOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Filter POIs</h4>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(POI_CATEGORIES).map(([key, category]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedPOICategories.has(key as POI["category"])}
                    onChange={() => togglePOICategory(key as POI["category"])}
                    className="rounded border-gray-300"
                  />
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
            {selectedPOICategories.size > 0 && (
              <button
                onClick={() => setSelectedPOICategories(new Set())}
                className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Zone Legend */}
      <div className="absolute top-4 right-4 z-[1000]">
        {/* Legend Toggle Button */}
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <MapIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Zones</span>
          {isLegendOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Legend Dropdown */}
        {isLegendOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
            <div className="p-3">
              <h4 className="font-semibold mb-3 text-gray-700">
                Click to navigate to zone
              </h4>
              <div className="space-y-2">
                {zonesWithDistance.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleLegendZoneClick(zone)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getZoneColor(zone.id) }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {zone.name.replace(" Zone", "").replace(" - CMZ", "")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {zone.location}
                      </div>
                      {zone.distance && (
                        <div className="text-xs text-gray-400">
                          {zone.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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

        <MapReady onMapReady={handleMapReady} />

        {userLocation && <LocationMarker userLocation={userLocation} />}

        {/* POI Markers */}
        {getFilteredPOIs().map((poi) => (
          <Marker
            key={poi.id}
            position={poi.coordinates}
            icon={createPOIIcon(poi)}
          >
            <Popup>
              <div className="text-center min-w-[200px]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg">
                    {POI_CATEGORIES[poi.category].icon}
                  </span>
                  <h3 className="font-bold text-lg">{poi.name}</h3>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {POI_CATEGORIES[poi.category].name}
                </div>
                {poi.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {poi.description}
                  </p>
                )}
                {poi.hours && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Hours:</strong> {poi.hours}
                  </p>
                )}
                {poi.phone && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Phone:</strong> {poi.phone}
                  </p>
                )}
                <button
                  onClick={() => {
                    const url =
                      poi.googleMapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${poi.coordinates[0]},${poi.coordinates[1]}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition-colors"
                  style={{
                    backgroundColor: POI_CATEGORIES[poi.category].color,
                  }}
                >
                  🧭 Navigate to {poi.name}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {zonesWithDistance.map((zone) => {
          const color = getZoneColor(zone.id);

          return (
            <Marker
              key={zone.id}
              position={zone.coordinates}
              icon={createZoneIcon(zone)}
              ref={(ref) => {
                if (ref) {
                  handleMarkerReady(ref, zone.id);
                }
              }}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{zone.location}</p>
                  {zone.distance && (
                    <p className="text-sm font-medium mb-3" style={{ color }}>
                      {zone.distance.toFixed(1)} km away
                    </p>
                  )}

                  {/* POIs in this zone */}
                  {zone.pois && zone.pois.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Points of Interest:
                      </h4>
                      <div className="space-y-1">
                        {zone.pois.map((poi) => (
                          <div
                            key={poi.id}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <span>{POI_CATEGORIES[poi.category].icon}</span>
                            <span>{poi.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onZoneClick(zone)}
                    className="w-full text-white px-4 py-2 rounded-md text-sm hover:opacity-90 transition-colors"
                    style={{ backgroundColor: color }}
                  >
                    🧭 Navigate with Google Maps
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Center on Location Button */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView(userLocation, 15, { animate: true });
            }
          }}
          className="absolute bottom-4 right-4 z-[1000] bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Center on my location"
        >
          <Crosshair className="h-5 w-5 text-blue-600" />
        </button>
      )}

      {/* Custom CSS for markers */}
      <style jsx>{`
        .custom-zone-marker {
          background: none !important;
          border: none !important;
        }
        .custom-poi-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
