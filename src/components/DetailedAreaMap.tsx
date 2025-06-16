"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  AreaPoint,
  AreaConfig,
  AREA_POI_CATEGORIES,
  getMarkerPriority,
  getPointsForZoom,
  getAllAreaPoints,
  filterCategories,
} from "@/data/areaDetails";
import {
  Navigation,
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  Phone,
  Crosshair,
  Zap,
  ChevronDown,
  Loader2,
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

interface DetailedAreaMapProps {
  areaConfig: AreaConfig;
  userLocation?: [number, number];
  onBackClick: () => void;
}

interface PointWithDistance extends AreaPoint {
  distance?: number;
}

// User location marker component
function LocationMarker({ userLocation }: { userLocation: [number, number] }) {
  const userIcon = new L.DivIcon({
    html: `
      <div style="position: relative;">
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

  return (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <strong>Your Location</strong>
          </div>
          <p className="text-sm text-gray-600">
            Lat: {userLocation[0].toFixed(6)}
          </p>
          <p className="text-sm text-gray-600">
            Lng: {userLocation[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// Map ready handler component
function MapReady({
  onMapReady,
  onZoomChange,
}: {
  onMapReady: (map: L.Map) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);

    const handleZoomEnd = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onMapReady, onZoomChange]);

  return null;
}

export default function DetailedAreaMap({
  areaConfig,
  userLocation,
  onBackClick,
}: DetailedAreaMapProps) {
  const [currentZoom, setCurrentZoom] = useState(areaConfig.defaultZoom);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilterGroup, setSelectedFilterGroup] = useState<
    keyof typeof filterCategories | "all"
  >("all");
  const [pointsWithDistance, setPointsWithDistance] = useState<
    PointWithDistance[]
  >([]);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(120); // Initial height
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate distances when user location changes
  useEffect(() => {
    const allPoints = getAllAreaPoints();
    if (userLocation) {
      const pointsWithDist = allPoints.map((point) => ({
        ...point,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          point.coordinates[0],
          point.coordinates[1]
        ),
      }));

      // Sort by distance
      pointsWithDist.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setPointsWithDistance(pointsWithDist);
    } else {
      setPointsWithDistance(allPoints);
    }
  }, [userLocation]);

  // Filter points based on zoom, search, and category
  const getFilteredPoints = useCallback(() => {
    let points = pointsWithDistance;

    // Filter by zoom level (progressive disclosure)
    points = getPointsForZoom(points, currentZoom);

    // Filter by search term
    if (searchTerm) {
      points = points.filter(
        (point) =>
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (point.description &&
            point.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category group
    if (selectedFilterGroup !== "all") {
      const categories = filterCategories[selectedFilterGroup];
      points = points.filter((point) => categories.includes(point.category));
    }

    return points;
  }, [pointsWithDistance, currentZoom, searchTerm, selectedFilterGroup]);

  const filteredPoints = getFilteredPoints();

  // Handle map ready
  const handleMapReady = useCallback(
    (map: L.Map) => {
      mapRef.current = map;
      map.setMaxBounds(areaConfig.maxBounds);
    },
    [areaConfig.maxBounds]
  );

  // Handle zoom change
  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // Handle point click - open Google Maps
  const handlePointClick = useCallback((point: AreaPoint) => {
    window.open(point.googleMapsUrl, "_blank", "noopener,noreferrer");
  }, []);

  // Create optimized marker icon
  const createPointIcon = useCallback(
    (point: PointWithDistance) => {
      const category =
        AREA_POI_CATEGORIES[
          point.category as keyof typeof AREA_POI_CATEGORIES
        ] || AREA_POI_CATEGORIES.facility;
      const priority = getMarkerPriority(point, currentZoom);

      return new L.DivIcon({
        html: `
          <div style="position: relative; text-align: center;">
            <div style="
              background: ${category.color};
              color: white;
              border-radius: 50%;
              width: ${priority.size}px;
              height: ${priority.size}px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${priority.size > 32 ? "18px" : "14px"};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: transform 0.2s ease;
            ">
              ${category.icon}
            </div>
            ${
              priority.showLabel
                ? `
              <div style="
                position: absolute;
                top: ${priority.size + 8}px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                color: #374151;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: ${priority.size > 36 ? "11px" : "9px"};
                font-weight: 600;
                white-space: nowrap;
                border: 1px solid rgba(0,0,0,0.1);
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${
                  point.name.length > 12
                    ? point.name.substring(0, 12) + "..."
                    : point.name
                }
              </div>
            `
                : ""
            }
          </div>
        `,
        className: "custom-area-marker",
        iconSize: [
          priority.size,
          priority.showLabel ? priority.size + 25 : priority.size,
        ],
        iconAnchor: [priority.size / 2, priority.size / 2],
      });
    },
    [currentZoom]
  );

  // Quick navigation to zones
  const quickNavTo = useCallback(
    (target: "cmz" | "imadi") => {
      if (mapRef.current) {
        const zone = areaConfig.zones[target];
        mapRef.current.setView(zone.coordinates, 17, { animate: true });
      }
    },
    [areaConfig.zones]
  );

  // Calculate distance helper
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Show loading during hydration
  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Clean Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="bg-white rounded-full shadow-lg p-3 hover:bg-gray-50 transition-all hover:scale-105"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Search (expandable) */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isSearchOpen ? "opacity-100" : "opacity-90"
          }`}
        >
          {isSearchOpen ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 py-2 px-1 text-sm border-none outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm("");
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full bg-white rounded-xl shadow-lg p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-gray-500">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search facilities...</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={areaConfig.center}
        zoom={areaConfig.defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        maxBounds={areaConfig.maxBounds}
        maxBoundsViscosity={0.8}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapReady onMapReady={handleMapReady} onZoomChange={handleZoomChange} />

        {userLocation && <LocationMarker userLocation={userLocation} />}

        {/* Render filtered points */}
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            position={point.coordinates}
            icon={createPointIcon(point)}
          >
            <Popup>
              <div className="text-center min-w-[220px] max-w-[280px]">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-xl">
                    {AREA_POI_CATEGORIES[
                      point.category as keyof typeof AREA_POI_CATEGORIES
                    ]?.icon || "📍"}
                  </span>
                  <h3 className="font-bold text-lg">{point.name}</h3>
                </div>

                {point.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {point.description}
                  </p>
                )}

                <div className="space-y-2 mb-4 text-xs text-gray-600">
                  {point.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{point.hours}</span>
                    </div>
                  )}
                  {point.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{point.phone}</span>
                    </div>
                  )}
                  {point.distance && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{point.distance.toFixed(1)} km away</span>
                    </div>
                  )}
                  {point.walkingTimeFromCMZ && (
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      <span>{point.walkingTimeFromCMZ} min from CMZ</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePointClick(point)}
                  className="w-full text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 justify-center"
                  style={{
                    backgroundColor:
                      AREA_POI_CATEGORIES[
                        point.category as keyof typeof AREA_POI_CATEGORIES
                      ]?.color || "#6B7280",
                  }}
                >
                  <Navigation className="h-4 w-4" />
                  Navigate with Google Maps
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Quick Navigation Chips */}
      <div className="absolute bottom-32 left-4 right-4 z-[1000]">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => quickNavTo("cmz")}
            className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            🕌 Go to CMZ
          </button>
          <button
            onClick={() => quickNavTo("imadi")}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🕌 Go to Imadi
          </button>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="absolute bottom-20 left-4 right-4 z-[1000]">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFilterGroup("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedFilterGroup === "all"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {Object.entries(filterCategories).map(([key, categories]) => (
            <button
              key={key}
              onClick={() =>
                setSelectedFilterGroup(key as keyof typeof filterCategories)
              }
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                selectedFilterGroup === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredPoints.length} facilities • Zoom {currentZoom}
            </span>
          </div>
          {userLocation && (
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.setView(userLocation, 17, { animate: true });
                }
              }}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="Center on my location"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-area-marker {
          background: none !important;
          border: none !important;
        }
        .custom-area-marker:hover div:first-child {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
