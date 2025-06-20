import { useState, useEffect, useMemo } from "react";
import {
  zones,
  Zone,
  calculateDistance,
  getAllPOIs,
  POI,
  POI_CATEGORIES,
} from "@/data/zones";
import {
  Search,
  Navigation,
  MapPin,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Hospital,
  Building2,
} from "lucide-react";

interface POIWithDistance extends POI {
  distance?: number;
  zoneName?: string;
}

interface ZoneWithDistance extends Zone {
  distance?: number;
}

interface POIListProps {
  userLocation?: [number, number];
  onPOIClick: (poi: POI | Zone, type: "poi" | "zone") => void;
  onZoneClick: (zone: Zone) => void;
}

type FilterType =
  | "all"
  | "zones"
  | "medical"
  | "khaas"
  | "hospital"
  | "pharmacy";

export default function POIList({
  userLocation,
  onPOIClick,
  onZoneClick,
}: POIListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "distance" | "type">("name");

  // Calculate distances and prepare data
  const { poisWithDistance, zonesWithDistance } = useMemo(() => {
    const allPOIs = getAllPOIs();

    const poisWithDist: POIWithDistance[] = allPOIs.map((poi) => {
      const distance = userLocation
        ? calculateDistance(
            userLocation[0],
            userLocation[1],
            poi.coordinates[0],
            poi.coordinates[1]
          )
        : undefined;

      // Find which zone this POI belongs to
      const zone = zones.find((z) => z.pois.some((p) => p.id === poi.id));
      const zoneName = zone?.name;

      return { ...poi, distance, zoneName };
    });

    const zonesWithDist: ZoneWithDistance[] = zones.map((zone) => {
      const distance = userLocation
        ? calculateDistance(
            userLocation[0],
            userLocation[1],
            zone.coordinates[0],
            zone.coordinates[1]
          )
        : undefined;
      return { ...zone, distance };
    });

    return { poisWithDistance: poisWithDist, zonesWithDistance: zonesWithDist };
  }, [userLocation]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let items: (POIWithDistance | ZoneWithDistance)[] = [];

    // Filter by type
    if (activeFilter === "zones") {
      items = zonesWithDistance;
    } else if (activeFilter === "all") {
      items = [...zonesWithDistance, ...poisWithDistance];
    } else {
      items = poisWithDistance.filter((poi) => poi.category === activeFilter);
    }

    // Search filter
    if (searchTerm) {
      items = items.filter((item) => {
        const name = item.name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        if ("location" in item) {
          // Zone
          return (
            name.includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower)
          );
        } else {
          // POI
          const poi = item as POIWithDistance;
          return (
            name.includes(searchLower) ||
            poi.description?.toLowerCase().includes(searchLower) ||
            poi.zoneName?.toLowerCase().includes(searchLower)
          );
        }
      });
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return (a.distance || Infinity) - (b.distance || Infinity);
        case "type":
          const getTypeOrder = (item: POIWithDistance | ZoneWithDistance) => {
            if ("location" in item) return 0; // zones first
            const poi = item as POIWithDistance;
            switch (poi.category) {
              case "medical":
                return 1;
              case "khaas":
                return 2;
              case "hospital":
                return 3;
              case "pharmacy":
                return 4;
              default:
                return 5;
            }
          };
          return getTypeOrder(a) - getTypeOrder(b);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return items;
  }, [poisWithDistance, zonesWithDistance, searchTerm, activeFilter, sortBy]);

  const filterOptions: {
    key: FilterType;
    label: string;
    icon: string;
    count: number;
  }[] = [
    {
      key: "all",
      label: "All",
      icon: "🏠",
      count: poisWithDistance.length + zonesWithDistance.length,
    },
    {
      key: "zones",
      label: "Zones",
      icon: "📍",
      count: zonesWithDistance.length,
    },
    {
      key: "medical",
      label: "Medical (Aam)",
      icon: "🏥",
      count: poisWithDistance.filter((p) => p.category === "medical").length,
    },
    {
      key: "khaas",
      label: "Medical (Khaas)",
      icon: "🏨",
      count: poisWithDistance.filter((p) => p.category === "khaas").length,
    },
    {
      key: "hospital",
      label: "Hospitals",
      icon: "🏥",
      count: poisWithDistance.filter((p) => p.category === "hospital").length,
    },
    {
      key: "pharmacy",
      label: "Pharmacies",
      icon: "💊",
      count: poisWithDistance.filter((p) => p.category === "pharmacy").length,
    },
  ];

  const handleItemClick = (item: POIWithDistance | ZoneWithDistance) => {
    if ("location" in item) {
      // Zone
      onZoneClick(item);
    } else {
      // POI
      onPOIClick(item, "poi");
    }
  };

  const getItemIcon = (item: POIWithDistance | ZoneWithDistance) => {
    if ("location" in item) {
      return <MapPin className="h-4 w-4 text-blue-600" />;
    } else {
      const poi = item as POIWithDistance;
      return (
        <span className="text-sm">{POI_CATEGORIES[poi.category].icon}</span>
      );
    }
  };

  const getItemType = (item: POIWithDistance | ZoneWithDistance) => {
    if ("location" in item) {
      return "Zone";
    } else {
      const poi = item as POIWithDistance;
      return POI_CATEGORIES[poi.category].name;
    }
  };

  const getItemSubtitle = (item: POIWithDistance | ZoneWithDistance) => {
    if ("location" in item) {
      return item.location;
    } else {
      const poi = item as POIWithDistance;
      return poi.zoneName || poi.description || "Standalone location";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search and Filter Header */}
      <div className="p-4 border-b bg-gray-50 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones, hospitals, pharmacies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter and Sort Row */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {filterOptions.find((f) => f.key === activeFilter)?.label}
              </span>
              {activeFilter !== "all" && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                  {filteredData.length}
                </span>
              )}
              {isFilterOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                <div className="p-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setActiveFilter(option.key);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left hover:bg-gray-50 transition-colors ${
                        activeFilter === option.key
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="flex-1 text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({option.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "name" | "distance" | "type")
            }
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            {userLocation && <option value="distance">Sort by Distance</option>}
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <div
              key={`${"location" in item ? "zone" : "poi"}-${item.id}`}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getItemIcon(item)}
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {getItemType(item)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6 truncate">
                    {getItemSubtitle(item)}
                  </p>
                  {item.distance && (
                    <div className="flex items-center mt-2 ml-6">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          item.distance < 2
                            ? "bg-green-500"
                            : item.distance < 5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.distance.toFixed(1)} km away
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                  className="ml-4 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Navigation className="h-4 w-4" />
                  Go
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No results found</p>
            <p className="text-sm">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-600 text-center">
          {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}{" "}
          found
          {userLocation && ` • Sorted by ${sortBy}`}
        </p>
      </div>

      {/* Overlay to close filter dropdown */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
