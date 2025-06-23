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
  Search,
  MapPin,
} from "lucide-react";
import HospitalDrawer from "./HospitalDrawer";
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
  onLocationRequest: () => void;
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

export default function Map({
  userLocation,
  onZoneClick,
  onLocationRequest,
}: MapProps) {
  const [zonesWithDistance, setZonesWithDistance] =
    useState<ZoneWithDistance[]>(zones);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPOICategories, setSelectedPOICategories] = useState<
    Set<POI["category"]>
  >(new Set(["khaas"]));
  const [selectedHospital, setSelectedHospital] = useState<POI | null>(null);
  const [isHospitalDrawerOpen, setIsHospitalDrawerOpen] = useState(false);
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<(POI | Zone)[]>([]);
  const [showMapSearch, setShowMapSearch] = useState(false);
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

  // Handle hospital click - open drawer
  const handleHospitalClick = (hospital: POI) => {
    setSelectedHospital(hospital);
    setIsHospitalDrawerOpen(true);
  };

  // Get filtered POIs to display
  const getFilteredPOIs = (): POI[] => {
    if (selectedPOICategories.size === 0) return [];
    return getAllPOIs().filter((poi) =>
      selectedPOICategories.has(poi.category)
    );
  };

  // Map search functionality
  const handleMapSearch = (searchTerm: string) => {
    setMapSearchTerm(searchTerm);

    if (!searchTerm.trim()) {
      setMapSearchResults([]);
      return;
    }

    const allPOIs = getAllPOIs();
    const searchLower = searchTerm.toLowerCase();

    // Search in POIs
    const poiResults = allPOIs.filter(
      (poi) =>
        poi.name.toLowerCase().includes(searchLower) ||
        poi.description?.toLowerCase().includes(searchLower) ||
        POI_CATEGORIES[poi.category].name.toLowerCase().includes(searchLower)
    );

    // Search in zones
    const zoneResults = zones.filter(
      (zone) =>
        zone.name.toLowerCase().includes(searchLower) ||
        zone.location.toLowerCase().includes(searchLower)
    );

    setMapSearchResults([...zoneResults, ...poiResults]);
  };

  // Handle search result click
  const handleSearchResultClick = (item: POI | Zone) => {
    if (mapRef.current) {
      // Navigate to the location with a higher zoom level for better visibility
      mapRef.current.setView(item.coordinates, 17, { animate: true });

      // Check if it's a Zone or POI
      const isZone = "location" in item;

      if (isZone) {
        // For zones, find and open the zone marker
        const marker = markersRef.current[item.id];
        if (marker) {
          setTimeout(() => {
            marker.openPopup();
            // Add visual feedback that the search worked
            marker
              .getElement()
              ?.style.setProperty("animation", "bounce 0.6s ease-in-out");
            setTimeout(() => {
              marker.getElement()?.style.removeProperty("animation");
            }, 600);
          }, 600);
        }
      } else {
        // For POIs, ensure the category is enabled in the filter
        const poi = item as POI;

        // Auto-enable the POI category if it's not already enabled
        if (!selectedPOICategories.has(poi.category)) {
          setSelectedPOICategories((prev) => new Set([...prev, poi.category]));
        }

        // Try to find and open the POI marker
        // Since POIs use the same marker system, look for the marker by ID
        const findAndOpenMarker = () => {
          const marker = markersRef.current[poi.id];
          if (marker) {
            marker.openPopup();
            // Add visual feedback that the search worked
            marker
              .getElement()
              ?.style.setProperty("animation", "bounce 0.6s ease-in-out");
            setTimeout(() => {
              marker.getElement()?.style.removeProperty("animation");
            }, 600);
          } else {
            // If marker not found immediately, try again after a short delay
            // This gives time for the POI category to be enabled and markers to render
            setTimeout(() => {
              const retryMarker = markersRef.current[poi.id];
              if (retryMarker) {
                retryMarker.openPopup();
                retryMarker
                  .getElement()
                  ?.style.setProperty("animation", "bounce 0.6s ease-in-out");
                setTimeout(() => {
                  retryMarker.getElement()?.style.removeProperty("animation");
                }, 600);
              }
            }, 300);
          }
        };

        setTimeout(findAndOpenMarker, 500);
      }
    }

    // Clear search
    setMapSearchTerm("");
    setMapSearchResults([]);
    setShowMapSearch(false);
  };

  // Create POI marker icon
  const createPOIIcon = (poi: POI) => {
    const category = POI_CATEGORIES[poi.category];
    const showLabel = poi.category === "khaas"; // Show labels for Khaas medical POIs

    return new L.DivIcon({
      html: `
        <div style="position: relative; text-align: center;">
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
          ${
            showLabel
              ? `
            <div style="
              position: absolute;
              top: 52px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(147, 51, 234, 0.95);
              color: white;
              padding: 1px 4px;
              border-radius: 3px;
              font-size: 8px;
              font-weight: 500;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.3);
              box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            ">
              Mahal us Shifa Khaas
            </div>
          `
              : ""
          }
        </div>
      `,
      className: "custom-poi-marker",
      iconSize: [32, showLabel ? 70 : 32], // Increased height for labeled markers
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
      {/* Top Control Bar */}
      {!isHospitalDrawerOpen && (
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* POI Filter */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-white rounded-lg shadow-lg px-2 py-2 sm:px-3 flex items-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  POIs
                </span>
                {selectedPOICategories.size > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {selectedPOICategories.size}
                  </span>
                )}
              </button>

              {/* POI Filter Dropdown */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[220px] z-20">
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
                          checked={selectedPOICategories.has(
                            key as POI["category"]
                          )}
                          onChange={() =>
                            togglePOICategory(key as POI["category"])
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm text-gray-700">
                          {category.name}
                        </span>
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

            {/* Search Bar - Central */}
            <div className="flex-1 relative min-w-0 max-w-sm mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={mapSearchTerm}
                  onChange={(e) => handleMapSearch(e.target.value)}
                  onFocus={() => setShowMapSearch(true)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white rounded-lg shadow-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {mapSearchTerm && (
                  <button
                    onClick={() => {
                      setMapSearchTerm("");
                      setMapSearchResults([]);
                      setShowMapSearch(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showMapSearch && mapSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto z-20 min-w-[280px] max-w-sm">
                  {mapSearchResults.slice(0, 6).map((item) => {
                    const isZone = "location" in item;
                    const poi = item as POI;
                    const zone = item as Zone;

                    return (
                      <button
                        key={`search-${item.id}`}
                        onClick={() => handleSearchResultClick(item)}
                        className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {isZone ? (
                            <MapPin className="h-4 w-4 text-blue-600" />
                          ) : (
                            <span className="text-base">
                              {POI_CATEGORIES[poi.category]?.icon}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {isZone
                              ? zone.location
                              : poi.description ||
                                POI_CATEGORIES[poi.category]?.name}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
                            {isZone
                              ? "Zone"
                              : POI_CATEGORIES[poi.category]?.name.split(
                                  " "
                                )[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {mapSearchResults.length > 6 && (
                    <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                      +{mapSearchResults.length - 6} more results
                    </div>
                  )}
                </div>
              )}

              {/* No results message */}
              {showMapSearch &&
                mapSearchTerm &&
                mapSearchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-center text-gray-500 z-20 min-w-[280px] max-w-sm">
                    <Search className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                    <p className="text-xs">No results found</p>
                  </div>
                )}
            </div>

            {/* Zone Legend */}
            <div className="relative">
              <button
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="bg-white rounded-lg shadow-lg px-2 py-2 sm:px-3 flex items-center gap-1 sm:gap-2 hover:bg-gray-50 transition-colors"
              >
                <MapIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  Zones
                </span>
                {isLegendOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>

              {/* Legend Dropdown */}
              {isLegendOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[60vh] overflow-y-auto min-w-[240px] z-20">
                  <div className="p-3">
                    <h4 className="font-semibold mb-3 text-gray-700">
                      Click to navigate to zone
                    </h4>
                    <div className="space-y-1">
                      {zonesWithDistance.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => handleLegendZoneClick(zone)}
                          className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-left"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getZoneColor(zone.id) }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {zone.name
                                .replace(" Zone", "")
                                .replace(" - CMZ", "")}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
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
          </div>
        </div>
      )}

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
            ref={(ref) => {
              if (ref) {
                markersRef.current[poi.id] = ref;
              }
            }}
          >
            <Popup>
              <div className="text-center max-w-[280px]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg">
                    {POI_CATEGORIES[poi.category].icon}
                  </span>
                  <h3 className="font-bold text-base">{poi.name}</h3>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {POI_CATEGORIES[poi.category].name}
                </div>
                {poi.description && (
                  <p className="text-xs text-gray-600 mb-2">
                    {poi.description}
                  </p>
                )}
                {poi.hours && (
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Hours:</strong> {poi.hours}
                  </p>
                )}
                {poi.phone && (
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Phone:</strong> {poi.phone}
                  </p>
                )}

                {poi.category === "hospital" && poi.coordinators ? (
                  // Hospital - Show coordinator info button
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleHospitalClick(poi)}
                      className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition-colors"
                    >
                      👥 Coordinators & Info
                    </button>
                    <button
                      onClick={() => {
                        const url =
                          poi.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${poi.coordinates[0]},${poi.coordinates[1]}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors"
                      style={{
                        backgroundColor: POI_CATEGORIES[poi.category].color,
                      }}
                    >
                      🧭 Navigate
                    </button>
                  </div>
                ) : (
                  // Regular POI - Just navigation
                  <button
                    onClick={() => {
                      const url =
                        poi.googleMapsUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${poi.coordinates[0]},${poi.coordinates[1]}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors"
                    style={{
                      backgroundColor: POI_CATEGORIES[poi.category].color,
                    }}
                  >
                    🧭 Navigate
                  </button>
                )}
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
                <div className="text-center max-w-[280px]">
                  <h3 className="font-bold text-base mb-1">{zone.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{zone.location}</p>
                  {zone.distance && (
                    <p className="text-xs font-medium mb-2" style={{ color }}>
                      {zone.distance.toFixed(1)} km away
                    </p>
                  )}

                  {/* POIs in this zone */}
                  {zone.pois && zone.pois.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">
                        Services:
                      </h4>
                      <div className="space-y-0.5">
                        {zone.pois.slice(0, 3).map((poi) => (
                          <div
                            key={poi.id}
                            className="flex items-center gap-1 text-xs text-gray-600"
                          >
                            <span className="text-xs">
                              {POI_CATEGORIES[poi.category].icon}
                            </span>
                            <span className="truncate">{poi.name}</span>
                          </div>
                        ))}
                        {zone.pois.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{zone.pois.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onZoneClick(zone)}
                    className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors"
                    style={{ backgroundColor: color }}
                  >
                    🧭 Navigate
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Persistent Location Button */}
      {!isHospitalDrawerOpen && (
        <button
          onClick={() => {
            if (userLocation && mapRef.current) {
              // If location is available, center on it
              mapRef.current.setView(userLocation, 15, { animate: true });
            } else {
              // If no location, request it from parent component
              onLocationRequest();
            }
          }}
          className={`absolute bottom-6 right-6 z-[1000] rounded-full shadow-lg p-3 transition-colors border ${
            userLocation
              ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
              : "bg-white hover:bg-gray-50 border-gray-200 text-gray-400"
          }`}
          title={userLocation ? "Center on my location" : "Enable location"}
        >
          <Crosshair className="h-5 w-5" />
        </button>
      )}

      {/* Overlay to close dropdowns */}
      {(showMapSearch || isFilterOpen || isLegendOpen) && (
        <div
          className="fixed inset-0 z-[15]"
          onClick={() => {
            setShowMapSearch(false);
            setIsFilterOpen(false);
            setIsLegendOpen(false);
          }}
        />
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

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      {/* Hospital Information Drawer */}
      <HospitalDrawer
        hospital={selectedHospital}
        isOpen={isHospitalDrawerOpen}
        onClose={() => setIsHospitalDrawerOpen(false)}
        userLocation={userLocation}
      />
    </div>
  );
}
