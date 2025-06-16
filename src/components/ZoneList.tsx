"use client";

import { useState, useEffect } from "react";
import { zones, Zone, calculateDistance } from "@/data/zones";
import { Search, Navigation, MapPin, Circle } from "lucide-react";

interface ZoneWithDistance extends Zone {
  distance?: number;
}

interface ZoneListProps {
  userLocation?: [number, number];
  onZoneClick: (zone: Zone) => void;
}

export default function ZoneList({ userLocation, onZoneClick }: ZoneListProps) {
  const [zonesWithDistance, setZonesWithDistance] =
    useState<ZoneWithDistance[]>(zones);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredZones = zonesWithDistance.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Zone List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onZoneClick(zone)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-900 truncate">
                      {zone.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{zone.location}</p>
                  {zone.distance && (
                    <div className="flex items-center mt-2 ml-6">
                      <Circle
                        className={`w-3 h-3 mr-2 ${
                          zone.distance < 5
                            ? "fill-green-500 text-green-500"
                            : "fill-red-500 text-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {zone.distance.toFixed(1)} km away
                      </span>
                    </div>
                  )}

                  {/* Show detailed area link for CMZ and Imadi zones */}
                  {(zone.id === "saifee-masjid-cmz" ||
                    zone.id === "imadi-zone") && (
                    <div className="mt-2 ml-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open("/area/cmz-imadi", "_self");
                        }}
                        className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        🗺️ View detailed area map
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoneClick(zone);
                  }}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Navigation className="h-4 w-4" />
                  Navigate
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredZones.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No zones found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-600 text-center">
          {filteredZones.length} zone{filteredZones.length !== 1 ? "s" : ""}{" "}
          available
          {userLocation && " • Sorted by distance"}
        </p>
      </div>
    </div>
  );
}
