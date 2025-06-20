export interface Coordinator {
  name: string;
  phone: string;
  role?: string; // e.g., "Primary Coordinator", "Doctor", "Duty Manager"
}

export interface POI {
  id: string;
  name: string;
  category: keyof typeof POI_CATEGORIES;
  coordinates: [number, number]; // [latitude, longitude]
  description?: string;
  phone?: string;
  hours?: string;
  googleMapsUrl?: string;
  // For hospitals serving multiple zones
  coordinators?: { [zoneId: string]: Coordinator[] };
  serviceZones?: string[];
  address?: string;
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
  hospital: {
    name: "Hospitals",
    icon: "🏥",
    color: "#dc2626",
  },
  pharmacy: {
    name: "Pharmacies",
    icon: "💊",
    color: "#059669",
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
  // Hospitals with zone-specific coordinators
  {
    id: "national-hospital-parrys",
    name: "National Hospital (Parrys)",
    category: "hospital",
    coordinates: [13.0964184, 80.2915263], // Parrys, George Town area
    address:
      "Chennai National Hospital, 12, Jaffar Sarang St, Parrys, George Town, Chennai, Tamil Nadu 600001",
    description:
      "Multi-specialty hospital serving multiple zones with emergency and consultation services",
    hours: "24/7 Emergency Services",
    googleMapsUrl: "https://maps.app.goo.gl/P66VebPVWmYsxprG7",
    serviceZones: [
      "saifee-masjid-cmz",
      "burhani-zone",
      "vajihi-zone",
      "imadi-zone",
    ],
    coordinators: {
      "saifee-masjid-cmz": [
        {
          name: "Aziz Bhai Rangwala",
          phone: "+919884030540",
          role: "Primary Coordinator",
        },
        {
          name: "Jafarus saqid bakir Rangwala",
          phone: "+919003097499",
          role: "Contact Person",
        },
        { name: "Dr. Shirin Marfatia", phone: "+919840114979", role: "Doctor" },
        { name: "Anbu", phone: "+91 96882 51360", role: "Hospital Contact" },
      ],
      "burhani-zone": [
        {
          name: "Murtaza Bhai Dalal",
          phone: "+91 9841005152",
          role: "Primary Coordinator",
        },
        {
          name: "SHK Murtaza Vakhariya",
          phone: "+919841081975",
          role: "Contact Person",
        },
        {
          name: "Aziz Bhai Rangwala",
          phone: "+919884030540",
          role: "Secondary Coordinator",
        },
        { name: "Anbu", phone: "+91 96882 51360", role: "Hospital Contact" },
      ],
      "vajihi-zone": [
        {
          name: "Ali Asger Shk Akberali Haidari",
          phone: "+91 94444 68649",
          role: "Primary Coordinator",
        },
        {
          name: "Dr. Zahabiya M Raja",
          phone: "+91 9884746021",
          role: "Doctor",
        },
        {
          name: "Aziz Bhai Rangwala",
          phone: "+919884030540",
          role: "Secondary Coordinator",
        },
        { name: "Anbu", phone: "+91 96882 51360", role: "Hospital Contact" },
      ],
      "imadi-zone": [
        {
          name: "Aziz Bhai Rangwala",
          phone: "+919884030540",
          role: "Primary Coordinator",
        },
        {
          name: "Juzer Bhai Badshah",
          phone: "+91 9841113169",
          role: "Contact Person",
        },
        {
          name: "Batul Colombo",
          phone: "+919940699209",
          role: "Secondary Coordinator",
        },
        { name: "Anbu", phone: "+91 96882 51360", role: "Hospital Contact" },
      ],
    },
  },
  {
    id: "apollo-hospitals-greams-road",
    name: "Apollo Hospitals (Greams Road)",
    category: "hospital",
    coordinates: [13.0631888, 80.2516072], // Thousand Lights area
    address:
      "Apollo Hospital, Enterprise Limited, 14, Greams Rd, Thousand Lights West, Thousand Lights, Chennai, Tamil Nadu 600006",
    description:
      "Premier multi-specialty hospital with advanced medical facilities",
    hours: "24/7 Emergency Services",
    googleMapsUrl: "https://maps.app.goo.gl/pPqWyQkh2M7uXpaC9",
    serviceZones: ["hakimi-zone", "taheri-zone"],
    coordinators: {
      "hakimi-zone": [
        {
          name: "Ammar Beaverwala",
          phone: "9841080887",
          role: "Primary Coordinator",
        },
        {
          name: "Zainab Millwala",
          phone: "+919884664000",
          role: "Contact Person",
        },
        {
          name: "Mariya Bhen Raja",
          phone: "+91 9841673288",
          role: "Secondary Coordinator",
        },
        {
          name: "Duty Manager",
          phone: "+91 7299082211",
          role: "Hospital Contact",
        },
      ],
      "taheri-zone": [
        {
          name: "Fatema Moiz",
          phone: "+91 9884333542",
          role: "Primary Coordinator",
        },
        {
          name: "Mariya Bhen Raja",
          phone: "+91 9841673288",
          role: "Secondary Coordinator",
        },
        {
          name: "Duty Manager",
          phone: "+91 7299082211",
          role: "Hospital Contact",
        },
      ],
    },
  },
  {
    id: "meridian-hospital",
    name: "Meridian Hospital",
    category: "hospital",
    coordinates: [13.1363207, 80.2159897], // Kolathur area
    address:
      "46D, Jawaharlal Nehru Salai, 200 Feet Ring Rd, Kolathur, Chennai, Tamil Nadu 600099",
    description: "Modern hospital facility serving northern Chennai areas",
    hours: "24/7 Emergency Services",
    googleMapsUrl: "https://maps.app.goo.gl/JUCnpLGKRsK7DVYn8",
    serviceZones: ["najmi-zone"],
    coordinators: {
      "najmi-zone": [
        {
          name: "Huzefa H Tambawala",
          phone: "+91 9789088109",
          role: "Primary Coordinator",
        },
        {
          name: "Fatema S Mujpurwala",
          phone: "+91 7397237852",
          role: "Contact Person",
        },
      ],
    },
  },
  {
    id: "apollo-first-med",
    name: "Apollo First Med",
    category: "hospital",
    coordinates: [13.0777253, 80.24593], // Kilpauk area
    address:
      "Apollo First Med Hospital, 154, Poonamallee High Rd, Kilpauk, Chennai, Tamil Nadu 600010",
    description:
      "Specialized medical facility with expert consultation services",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/P9AXCc4BKh786TH59",
    serviceZones: ["fakhri-zone"],
    coordinators: {
      "fakhri-zone": [
        {
          name: "Dr. Mustansir Kitabi",
          phone: "+91 8939258815",
          role: "Doctor",
        },
        { name: "Dr. Alefiya Akbari", phone: "+91 9677794067", role: "Doctor" },
      ],
    },
  },
  // Pharmacies
  {
    id: "apollo-pharmacy-nungambakkam",
    name: "Apollo Pharmacy - Nungambakkam",
    category: "pharmacy",
    coordinates: [13.0643853, 80.243343],
    description: "Apollo pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/Y1N3RkPfGtP5T56d6",
  },
  {
    id: "apollo-pharmacy-greams-road",
    name: "Apollo Pharmacy - Greams Road",
    category: "pharmacy",
    coordinates: [13.0630362, 80.2513374],
    description: "Apollo pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/F6iRoX39gvJZYUE2A",
  },
  {
    id: "muthu-pharma-t-nagar",
    name: "Muthu Pharma - T Nagar",
    category: "pharmacy",
    coordinates: [13.0505927, 80.240347],
    description: "Muthu pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/EakizSW7KKMWrzPPA",
  },
  {
    id: "muthu-pharma-egmore",
    name: "Muthu Pharma - Egmore",
    category: "pharmacy",
    coordinates: [13.0747061, 80.2556677],
    description: "Muthu pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/4wkxCrvzu2a8h16J8",
  },
  {
    id: "apollo-pharmacy-periamet",
    name: "Apollo Pharmacy - Periamet",
    category: "pharmacy",
    coordinates: [13.0854667, 80.2659144],
    description: "Apollo pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/qigEuAqm4zz67puy7",
  },
  {
    id: "apollo-pharmacy-ttk-road-alwarpet",
    name: "Apollo Pharmacy - TTK Road, Alwarpet",
    category: "pharmacy",
    coordinates: [13.0342003, 80.2538902],
    description: "Apollo pharmacy providing medicines and healthcare products",
    hours: "Please contact for hours",
    googleMapsUrl: "https://maps.app.goo.gl/2FZqmAzvpScP8q4R9",
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
