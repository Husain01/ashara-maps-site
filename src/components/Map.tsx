"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
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
  X,
  Search,
  MapPin,
  Heart,
  Stethoscope,
  Building2,
  Pill,
  Users,
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
          width: 24px;
          height: 24px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          position: absolute;
          top: -2px;
          left: -2px;
          animation: pulse 2s infinite;
        "></div>
        <!-- Main location dot -->
        <div style="
          width: 20px;
          height: 20px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
        "></div>
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
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

// POI Icon mapping to Lucide React icons
const POI_ICON_MAP = {
  medical: { icon: Heart, color: "#dc2626" }, // Red
  khaas: { icon: Stethoscope, color: "#7c3aed" }, // Purple
  hospital: { icon: Building2, color: "#c2410c" }, // Orange-red
  pharmacy: { icon: Pill, color: "#059669" }, // Green
};

export default function Map({
  userLocation,
  onZoneClick,
  onLocationRequest,
}: MapProps) {
  const [zonesWithDistance, setZonesWithDistance] =
    useState<ZoneWithDistance[]>(zones);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [selectedPOICategory, setSelectedPOICategory] = useState<
    POI["category"] | "all" | null
  >(null);
  const [selectedHospital, setSelectedHospital] = useState<POI | null>(null);
  const [isHospitalDrawerOpen, setIsHospitalDrawerOpen] = useState(false);
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState<(POI | Zone)[]>([]);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [showZoneMarkers, setShowZoneMarkers] = useState(true);
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

  // Handle POI category selection
  const selectPOICategory = (category: POI["category"] | "all" | null) => {
    setSelectedPOICategory(category);
  };

  // Handle hospital click - open drawer
  const handleHospitalClick = (hospital: POI) => {
    setSelectedHospital(hospital);
    setIsHospitalDrawerOpen(true);
  };

  // Get filtered POIs to display
  const getFilteredPOIs = (): POI[] => {
    const allPOIs = getAllPOIs();
    if (selectedPOICategory === null) {
      return []; // Show no POIs when no filter is selected
    }
    if (selectedPOICategory === "all") {
      return allPOIs;
    }
    return allPOIs.filter((poi) => poi.category === selectedPOICategory);
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

        // Auto-select the POI category if it's not already selected
        if (
          selectedPOICategory !== poi.category &&
          selectedPOICategory !== "all"
        ) {
          setSelectedPOICategory(poi.category);
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

  // Helper function to render POI icon component
  const renderPOIIcon = (category: POI["category"], size = 16) => {
    const iconConfig = POI_ICON_MAP[category];
    const IconComponent = iconConfig.icon;
    return <IconComponent size={size} style={{ color: iconConfig.color }} />;
  };

  // Create POI marker icon
  const createPOIIcon = (poi: POI) => {
    const iconConfig = POI_ICON_MAP[poi.category];
    const showLabel = poi.category === "khaas"; // Show labels for Khaas medical POIs

    return new L.DivIcon({
      html: `
        <div style="position: relative; text-align: center;">
          <div style="
            background: ${iconConfig.color};
            color: white;
            border-radius: 6px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${getIconSVGPath(poi.category)}
            </svg>
          </div>
          ${
            showLabel
              ? `
            <div style="
              position: absolute;
              top: 36px;
              left: 50%;
              transform: translateX(-50%);
              background: ${iconConfig.color};
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 600;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.3);
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">
              Mahal us Shifa Khaas
            </div>
          `
              : ""
          }
        </div>
      `,
      className: "custom-poi-marker",
      iconSize: [32, showLabel ? 56 : 32],
      iconAnchor: [16, 16],
    });
  };

  // Helper function to get SVG paths for different POI categories
  const getIconSVGPath = (category: POI["category"]) => {
    switch (category) {
      case "medical":
        // Heart icon
        return `<path d="m19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>`;
      case "khaas":
        // Stethoscope icon
        return `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`;
      case "hospital":
        // Building2 icon
        return `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`;
      case "pharmacy":
        // Pill icon
        return `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>`;
      default:
        return `<circle cx="12" cy="12" r="10"/>`;
    }
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

  // Get filtered POIs for rendering
  const filteredPOIs = useMemo(() => {
    return getFilteredPOIs();
  }, [selectedPOICategory, getFilteredPOIs]);

  return (
    <div className="h-full w-full relative">
      {/* Top Control Bar */}
      {!isHospitalDrawerOpen && (
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          {/* Main Controls Row */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            {/* Zone Toggle */}
            <button
              onClick={() => setShowZoneMarkers(!showZoneMarkers)}
              className={`rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 transition-colors border ${
                showZoneMarkers
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium hidden md:inline">
                Zones
              </span>
            </button>

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
                  className="w-full pl-10 pr-10 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto z-20 min-w-[280px] max-w-sm">
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
                            <span className="flex items-center">
                              {renderPOIIcon(poi.category, 16)}
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
                className="bg-white rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <MapIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  List
                </span>
                {isLegendOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>

              {/* Legend Dropdown */}
              {isLegendOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[60vh] overflow-y-auto min-w-[240px] z-20">
                  <div className="p-3">
                    <h4 className="font-semibold mb-3 text-gray-700">
                      Click to navigate to zone
                    </h4>
                    <div className="space-y-1">
                      {zonesWithDistance.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => handleLegendZoneClick(zone)}
                          className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                        >
                          <div
                            className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: getZoneColor(zone.id) }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm">
                              {zone.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {zone.location}
                              {zone.distance && (
                                <span className="ml-1">
                                  • {zone.distance.toFixed(1)} km
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="pills-container">
              {/* All POIs pill */}
              <button
                onClick={() => selectPOICategory("all")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedPOICategory === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All POIs
              </button>

              {/* Individual category pills with full proper names */}
              <button
                onClick={() => selectPOICategory("medical")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  selectedPOICategory === "medical"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {renderPOIIcon("medical", 14)}
                <span>Mahal us Shifa - Aam</span>
              </button>

              <button
                onClick={() => selectPOICategory("khaas")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  selectedPOICategory === "khaas"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {renderPOIIcon("khaas", 14)}
                <span>Mahal us Shifa - Khaas</span>
              </button>

              <button
                onClick={() => selectPOICategory("hospital")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  selectedPOICategory === "hospital"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {renderPOIIcon("hospital", 14)}
                <span>Hospitals</span>
              </button>

              <button
                onClick={() => selectPOICategory("pharmacy")}
                className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  selectedPOICategory === "pharmacy"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {renderPOIIcon("pharmacy", 14)}
                <span>Pharmacies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && <LocationMarker userLocation={userLocation} />}

        {/* Map Ready Handler */}
        <MapReady onMapReady={handleMapReady} />

        {/* Custom positioned zoom control */}
        <ZoomControl position="bottomleft" />

        {/* POI Markers */}
        {filteredPOIs.map((poi) => (
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
                  {renderPOIIcon(poi.category, 18)}
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
                      className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Users size={12} />
                      Coordinators & Info
                    </button>
                    <button
                      onClick={() => {
                        const url =
                          poi.googleMapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${poi.coordinates[0]},${poi.coordinates[1]}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-1"
                      style={{
                        backgroundColor: POI_ICON_MAP[poi.category].color,
                      }}
                    >
                      <Navigation size={12} />
                      Navigate
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
                    className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-1"
                    style={{
                      backgroundColor: POI_ICON_MAP[poi.category].color,
                    }}
                  >
                    <Navigation size={12} />
                    Navigate
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Zone Markers - Only show when toggled on */}
        {showZoneMarkers &&
          zonesWithDistance.map((zone) => {
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
                    <p className="text-xs text-gray-600 mb-2">
                      {zone.location}
                    </p>
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
                              <span className="flex items-center">
                                {renderPOIIcon(poi.category, 12)}
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
                      className="w-full text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-1"
                      style={{ backgroundColor: color }}
                    >
                      <Navigation size={12} />
                      Navigate to Zone
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
      {(showMapSearch || isLegendOpen) && (
        <div
          className="fixed inset-0 z-[15]"
          onClick={() => {
            setShowMapSearch(false);
            setIsLegendOpen(false);
          }}
        />
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .custom-zone-marker {
          background: none !important;
          border: none !important;
        }
        .custom-poi-marker {
          background: none !important;
          border: none !important;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow-x: scroll;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Ensure pills container is properly scrollable */
        .pills-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 4px;
        }

        .pills-container::-webkit-scrollbar {
          display: none;
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
