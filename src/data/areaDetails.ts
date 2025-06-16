import { POI, POI_CATEGORIES } from "./zones";

// Enhanced POI interface for area-specific details
export interface AreaPoint extends Omit<POI, "category"> {
  category: keyof typeof AREA_POI_CATEGORIES;
  icon?: string;
  buildingNumber?: string;
  floor?: string;
  entrance?: string;
  isMainFacility?: boolean;
  walkingTimeFromCMZ?: number; // in minutes
  walkingTimeFromImadi?: number; // in minutes
  zoomLevel?: number; // Minimum zoom level to show this point
}

export interface AreaConfig {
  center: [number, number];
  defaultZoom: number;
  bounds: [[number, number], [number, number]];
  maxBounds: [[number, number], [number, number]];
  zones: {
    cmz: AreaPoint;
    imadi: AreaPoint;
  };
  facilities: AreaPoint[];
}

// Enhanced POI categories for area-specific features
export const AREA_POI_CATEGORIES = {
  ...POI_CATEGORIES,
  entrance: { name: "Entrance", icon: "🚪", color: "#6B7280" },
  landmark: { name: "Landmark", icon: "📍", color: "#8B5CF6" },
  parking: { name: "Parking", icon: "🅿️", color: "#3B82F6" },
  food: { name: "Food", icon: "🍽️", color: "#F59E0B" },
  accommodation: { name: "Accommodation", icon: "🏠", color: "#8B5CF6" },
  office: { name: "Office", icon: "🏢", color: "#6366F1" },
  facility: { name: "Facility", icon: "🏢", color: "#6B7280" }, // Default fallback
  masjid: { name: "Masjid", icon: "🕌", color: "#10B981" }, // Ensure masjid is defined
};

// CMZ-Imadi Area Configuration
export const cmzImadiAreaConfig: AreaConfig = {
  center: [13.091219, 80.289073], // Midpoint between CMZ and Imadi
  defaultZoom: 16,
  bounds: [
    [13.089, 80.285],
    [13.094, 80.293],
  ],
  maxBounds: [
    [13.088, 80.284],
    [13.095, 80.294],
  ],
  zones: {
    cmz: {
      id: "saifee-masjid-cmz-detailed",
      name: "Saifee Masjid - CMZ",
      category: "masjid",
      coordinates: [13.0915575, 80.2902084],
      description:
        "Main Central Masjid Zone - Primary prayer area with full facilities",
      googleMapsUrl: "https://maps.app.goo.gl/kmyQu14sTDejWMGU6",
      icon: "🕌",
      isMainFacility: true,
      zoomLevel: 14,
      hours: "24/7 - Prayer times vary",
    },
    imadi: {
      id: "imadi-zone-detailed",
      name: "Imadi Zone",
      category: "masjid",
      coordinates: [13.090882, 80.287938],
      description:
        "Imadi Zone at Binny Mills - Secondary prayer area and community facilities",
      googleMapsUrl: "https://maps.app.goo.gl/5GC2QreXfihLcjZC6",
      icon: "🕌",
      isMainFacility: true,
      walkingTimeFromCMZ: 8,
      zoomLevel: 14,
      hours: "Prayer times and community events",
    },
  },
  facilities: [
    // Medical facilities (existing from POI system)
    {
      id: "mahal-us-shifa-aam-cmz-detailed",
      name: "Mahal us Shifa - Aam",
      category: "medical",
      coordinates: [13.0915575, 80.2902084],
      description:
        "General medical facility providing primary healthcare services",
      googleMapsUrl: "https://maps.app.goo.gl/kmyQu14sTDejWMGU6",
      icon: "🏥",
      hours: "24/7 Emergency Services",
      walkingTimeFromCMZ: 1,
      walkingTimeFromImadi: 8,
      zoomLevel: 15,
    },
    {
      id: "mahal-us-shifa-aam-imadi-detailed",
      name: "Mahal us Shifa - Aam",
      category: "medical",
      coordinates: [13.090882, 80.287938],
      description: "General medical facility at Imadi Zone",
      googleMapsUrl: "https://maps.app.goo.gl/5GC2QreXfihLcjZC6",
      icon: "🏥",
      hours: "24/7 Emergency Services",
      walkingTimeFromCMZ: 8,
      walkingTimeFromImadi: 1,
      zoomLevel: 15,
    },
    // Additional area-specific facilities
    {
      id: "cmz-main-entrance",
      name: "CMZ Main Entrance",
      category: "entrance",
      coordinates: [13.0916, 80.2901],
      description: "Primary entrance to Saifee Masjid CMZ",
      googleMapsUrl: "https://maps.app.goo.gl/kmyQu14sTDejWMGU6",
      icon: "🚪",
      walkingTimeFromCMZ: 0,
      walkingTimeFromImadi: 8,
      zoomLevel: 17,
    },
    {
      id: "imadi-main-entrance",
      name: "Imadi Zone Main Entrance",
      category: "entrance",
      coordinates: [13.0909, 80.2878],
      description: "Main entrance to Imadi Zone at Binny Mills",
      googleMapsUrl: "https://maps.app.goo.gl/5GC2QreXfihLcjZC6",
      icon: "🚪",
      walkingTimeFromCMZ: 8,
      walkingTimeFromImadi: 0,
      zoomLevel: 17,
    },
    // Parking areas
    {
      id: "cmz-parking-area-1",
      name: "CMZ Parking Area",
      category: "parking",
      coordinates: [13.0913, 80.29],
      description: "Designated parking area near CMZ",
      googleMapsUrl: "https://maps.app.goo.gl/kmyQu14sTDejWMGU6",
      icon: "🅿️",
      walkingTimeFromCMZ: 2,
      walkingTimeFromImadi: 10,
      zoomLevel: 16,
    },
    {
      id: "imadi-parking-area-1",
      name: "Imadi Parking Area",
      category: "parking",
      coordinates: [13.0907, 80.2877],
      description: "Parking facilities at Binny Mills compound",
      googleMapsUrl: "https://maps.app.goo.gl/5GC2QreXfihLcjZC6",
      icon: "🅿️",
      walkingTimeFromCMZ: 10,
      walkingTimeFromImadi: 2,
      zoomLevel: 16,
    },
  ],
};

// Helper function to get marker priority based on facility type and zoom
export function getMarkerPriority(point: AreaPoint, currentZoom: number) {
  if (point.isMainFacility) {
    return { size: 48, showLabel: true, priority: 1 };
  }

  if (point.category === "khaas") {
    return { size: 36, showLabel: true, priority: 2 };
  }

  if (point.category === "medical") {
    return { size: 32, showLabel: currentZoom >= 16, priority: 3 };
  }

  if (["parking", "food", "accommodation"].includes(point.category)) {
    return { size: 28, showLabel: currentZoom >= 17, priority: 4 };
  }

  // Micro facilities (entrances, etc.)
  return { size: 20, showLabel: false, priority: 5 };
}

// Helper function to filter points by zoom level
export function getPointsForZoom(
  points: AreaPoint[],
  zoom: number
): AreaPoint[] {
  return points.filter((point) => {
    const minZoom = point.zoomLevel || 15;
    return zoom >= minZoom;
  });
}

// Helper function to calculate walking time between two coordinates (rough estimate)
export function calculateWalkingTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // Walking speed: ~5 km/h, so minutes = (distance_km / 5) * 60
  return Math.round((distanceKm / 5) * 60);
}

// Helper function to get all facilities including zones
export function getAllAreaPoints(): AreaPoint[] {
  return [
    cmzImadiAreaConfig.zones.cmz,
    cmzImadiAreaConfig.zones.imadi,
    ...cmzImadiAreaConfig.facilities,
  ];
}

// Helper function to get facilities by category
export function getAreaPointsByCategory(category: string): AreaPoint[] {
  return getAllAreaPoints().filter((point) => point.category === category);
}

// Smart filter categories for clean UX
export const filterCategories = {
  essential: ["masjid", "medical", "khaas"],
  facilities: ["food", "accommodation", "parking"],
  navigation: ["entrance", "landmark"],
};

// Get filtered points by category group
export function getPointsByFilterGroup(
  group: keyof typeof filterCategories
): AreaPoint[] {
  const categories = filterCategories[group];
  return getAllAreaPoints().filter((point) =>
    categories.includes(point.category)
  );
}
