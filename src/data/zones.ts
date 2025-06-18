export interface POI {
  id: string;
  name: string;
  category: keyof typeof POI_CATEGORIES;
  coordinates: [number, number]; // [latitude, longitude]
  description?: string;
  phone?: string;
  hours?: string;
  googleMapsUrl?: string;
}

export interface Zone {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  googleMapsUrl: string;
  pois: POI[];
}

// POI Categories for filtering
export const POI_CATEGORIES = {
  medical: {
    name: "Mahal us Shifa Aam (Emergency)",
    icon: "🏥",
    color: "#ef4444",
  },
  khaas: {
    name: "Mahal us Shifa Khaas (Consultation)",
    icon: "🏨",
    color: "#9333ea",
  },
  // food: { name: "Food", icon: "🍽️", color: "#f59e0b" },
  // parking: { name: "Parking", icon: "🅿️", color: "#3b82f6" },
  // services: { name: "Services", icon: "🏢", color: "#8b5cf6" },
  // emergency: { name: "Emergency", icon: "🚨", color: "#dc2626" },
} as const;

export const zones: Zone[] = [
  {
    id: "saifee-masjid-cmz",
    name: "Saifee Masjid - CMZ",
    location: "Central Chennai",
    coordinates: [13.0915575, 80.2902084],
    googleMapsUrl: "https://maps.app.goo.gl/kmyQu14sTDejWMGU6",
    pois: [
      {
        id: "mahal-us-shifa-aam-cmz",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.0915575, 80.2902084], // Same as zone for now
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "imadi-zone",
    name: "Imadi Zone",
    location: "Binny Mills Compound",
    coordinates: [13.090882, 80.287938],
    googleMapsUrl: "https://maps.app.goo.gl/5GC2QreXfihLcjZC6",
    pois: [
      {
        id: "mahal-us-shifa-aam-imadi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.090882, 80.287938],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "hakimi-zone",
    name: "Hakimi Zone",
    location: "YMCA, Royapettah",
    coordinates: [13.054858, 80.263672],
    googleMapsUrl: "https://maps.app.goo.gl/TM32LAsm1HVJVB9F9",
    pois: [
      {
        id: "mahal-us-shifa-aam-hakimi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.054858, 80.263672],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
      {
        id: "mahal-us-shifa-khaas-hakimi",
        name: "Mahal us Shifa - Khaas (Consultation)",
        category: "khaas",
        coordinates: [13.054858, 80.263672],
        description:
          "Specialized medical facility providing advanced healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "fakhri-zone",
    name: "Fakhri Zone",
    location: "Wings Convention Centre, Kilpauk",
    coordinates: [13.077258, 80.232116],
    googleMapsUrl: "https://maps.app.goo.gl/KUmy8hMWrPYMUK3SA",
    pois: [
      {
        id: "mahal-us-shifa-aam-fakhri",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.077258, 80.232116],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
      {
        id: "mahal-us-shifa-khaas-fakhri",
        name: "Mahal us Shifa - Khaas (Consultation)",
        category: "khaas",
        coordinates: [13.077258, 80.232116],
        description:
          "Specialized medical facility providing advanced healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "burhani-zone",
    name: "Burhani Zone",
    location: "Burhani Masjid, Royapuram",
    coordinates: [13.106052, 80.295599],
    googleMapsUrl: "https://maps.app.goo.gl/52MpQMmnCfJtoRTQ9",
    pois: [
      {
        id: "mahal-us-shifa-aam-burhani",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.106052, 80.295599],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "mohammadi-zone",
    name: "Mohammadi Zone",
    location: "Mohammadi Masjid, Central Chennai",
    coordinates: [13.101854, 80.291943],
    googleMapsUrl: "https://maps.app.goo.gl/4vb3dwgotBHMnR5w6",
    pois: [
      {
        id: "mahal-us-shifa-aam-mohammadi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.101854, 80.291943],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "ezzi-zone",
    name: "Ezzi Zone",
    location: "Mufaddal Park Annex",
    coordinates: [13.107015, 80.296098],
    googleMapsUrl: "https://maps.app.goo.gl/YZRueSd2cPjYtZuy6",
    pois: [
      {
        id: "mahal-us-shifa-aam-ezzi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.107015, 80.296098],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "vajihi-zone",
    name: "Vajihi Zone",
    location: "Vajihee Masjid, Burhani Towers",
    coordinates: [13.1052031, 80.2770067],
    googleMapsUrl: "https://maps.app.goo.gl/bkXuwhunWkUpGj879",
    pois: [
      {
        id: "mahal-us-shifa-aam-vajihi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.1052031, 80.2770067],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "najmi-zone",
    name: "Najmi Zone",
    location: "Dawoodi Markaz, Madhavaram",
    coordinates: [13.1374827, 80.2312319],
    googleMapsUrl: "https://maps.app.goo.gl/H3fU1vXgZR3oihFw6",
    pois: [
      {
        id: "mahal-us-shifa-aam-najmi",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [13.1374827, 80.2312319],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
  {
    id: "taheri-zone",
    name: "Taheri Zone",
    location: "Burhani Markaz",
    coordinates: [12.97685, 80.2470166],
    googleMapsUrl: "https://maps.app.goo.gl/xxqXp4xZnxf6sDEF8",
    pois: [
      {
        id: "mahal-us-shifa-aam-taheri",
        name: "Mahal us Shifa - Aam (Emergency)",
        category: "medical",
        coordinates: [12.97685, 80.2470166],
        description: "Medical facility providing healthcare services",
        hours: "24/7 Emergency Services",
      },
    ],
  },
];

// Standalone POIs that are not associated with any specific zone
export const standalonePOIs: POI[] = [
  {
    id: "national-hospital-mannady",
    name: "National Hospital - Mahal us Shifa Khaas (Consultation)",
    category: "khaas",
    coordinates: [13.096349, 80.291892],
    description: "Specialized medical services and hospital",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/BJzKo5ZcAtwhZAtR6",
  },
  {
    id: "mufaddal-polyclinic-royapuram",
    name: "Mufaddal PolyClinic - Mahal us Shifa Khaas (Consultation)",
    category: "khaas",
    coordinates: [13.1073612, 80.2944235],
    description: "Specialized medical services and polyclinic",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/JqaY54CeRhyLrT1e9",
  },
  {
    id: "mahal-us-shifa-aam-near-cmz",
    name: "Mahal us Shifa - Aam (Emergency)",
    category: "medical",
    coordinates: [13.0925283, 80.2899732],
    description:
      "Emergency medical facility near CMZ providing healthcare services",
    hours: "24/7 Emergency Services",
    googleMapsUrl: "https://maps.app.goo.gl/VKaqw7VLe1hvdaYK7",
  },
];

// Helper function to calculate distance between two coordinates
export function calculateDistance(
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
  return R * c;
}

// Helper function to get all POIs from all zones and standalone POIs
export function getAllPOIs(): POI[] {
  return [...zones.flatMap((zone) => zone.pois), ...standalonePOIs];
}

// Helper function to get POIs by category
export function getPOIsByCategory(category: POI["category"]): POI[] {
  return getAllPOIs().filter((poi) => poi.category === category);
}

// Helper function to get POIs within a zone
export function getPOIsInZone(zoneId: string): POI[] {
  const zone = zones.find((z) => z.id === zoneId);
  return zone ? zone.pois : [];
}
