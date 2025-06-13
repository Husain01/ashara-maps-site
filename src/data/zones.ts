export interface Zone {
  id: string
  name: string
  location: string
  coordinates: [number, number] // [latitude, longitude]
  googleMapsUrl: string
}

export const zones: Zone[] = [
  {
    id: 'saifee-masjid-cmz',
    name: 'Saifee Masjid - CMZ',
    location: 'Central Chennai',
    coordinates: [13.091491, 80.289690],
    googleMapsUrl: 'https://maps.app.goo.gl/kmyQu14sTDejWMGU6'
  },
  {
    id: 'imadi-zone',
    name: 'Imadi Zone',
    location: 'Binny Mills Compound',
    coordinates: [13.090882, 80.287938],
    googleMapsUrl: 'https://maps.app.goo.gl/5GC2QreXfihLcjZC6'
  },
  {
    id: 'hakimi-zone',
    name: 'Hakimi Zone',
    location: 'YMCA, Royapettah',
    coordinates: [13.054858, 80.263672],
    googleMapsUrl: 'https://maps.app.goo.gl/TM32LAsm1HVJVB9F9'
  },
  {
    id: 'fakhri-zone',
    name: 'Fakhri Zone',
    location: 'Wings Convention Centre, Kilpauk',
    coordinates: [13.077258, 80.232116],
    googleMapsUrl: 'https://maps.app.goo.gl/KUmy8hMWrPYMUK3SA'
  },
  {
    id: 'burhani-zone',
    name: 'Burhani Zone',
    location: 'Burhani Masjid, Royapuram',
    coordinates: [13.106052, 80.295599],
    googleMapsUrl: 'https://maps.app.goo.gl/52MpQMmnCfJtoRTQ9'
  },
  {
    id: 'mohammadi-zone',
    name: 'Mohammadi Zone',
    location: 'Mohammadi Masjid, Central Chennai',
    coordinates: [13.1016173, 80.2917356],
    googleMapsUrl: 'https://maps.app.goo.gl/4vb3dwgotBHMnR5w6'
  },
  {
    id: 'ezzi-zone',
    name: 'Ezzi Zone',
    location: 'Mufaddal Park Annex',
    coordinates: [13.106873, 80.296189],
    googleMapsUrl: 'https://maps.app.goo.gl/YZRueSd2cPjYtZuy6'
  },
  {
    id: 'vajihi-zone',
    name: 'Vajihi Zone',
    location: 'Vajihee Masjid, Burhani Towers',
    coordinates: [13.1052031, 80.2770067],
    googleMapsUrl: 'https://maps.app.goo.gl/bkXuwhunWkUpGj879'
  },
  {
    id: 'najmi-zone',
    name: 'Najmi Zone',
    location: 'Dawoodi Markaz, Madhavaram',
    coordinates: [13.1497459, 80.2317],
    googleMapsUrl: 'https://maps.app.goo.gl/H3fU1vXgZR3oihFw6'
  },
  {
    id: 'taheri-zone',
    name: 'Taheri Zone',
    location: 'Burhani Markaz',
    coordinates: [12.97685, 80.2470166],
    googleMapsUrl: 'https://maps.app.goo.gl/xxqXp4xZnxf6sDEF8'
  }
]

// Helper function to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
} 