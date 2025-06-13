export interface RouteInfo {
  distance: number; // in kilometers
  duration: number; // in minutes
  coordinates: [number, number][];
  mode: TransportMode;
}

export type TransportMode = "driving" | "walking" | "cycling";

interface OpenRouteServiceResponse {
  routes: {
    summary: {
      distance: number; // in meters
      duration: number; // in seconds
    };
    geometry: {
      coordinates: [number, number][];
    };
  }[];
}

// OpenRouteService profiles mapping
const ORS_PROFILES = {
  driving: "driving-car",
  walking: "foot-walking",
  cycling: "cycling-regular",
};

export async function getRouteInfo(
  start: [number, number],
  end: [number, number],
  mode: TransportMode = "driving"
): Promise<RouteInfo | null> {
  try {
    // For development, we'll use a public demo key
    // In production, you should get your own free API key from openrouteservice.org
    const API_KEY =
      process.env.OPENROUTE_API_KEY ||
      "5b3ce3597851110001cf6248cd97c87c4dee4c2b89c0bfdc0a29fc83";

    const profile = ORS_PROFILES[mode];
    const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [start[1], start[0]], // ORS expects [lng, lat]
          [end[1], end[0]],
        ],
        format: "json",
        instructions: false,
        geometry: true,
      }),
    });

    if (!response.ok) {
      console.error("OpenRouteService API error:", response.status);
      return null;
    }

    const data: OpenRouteServiceResponse = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];

    return {
      distance: Math.round((route.summary.distance / 1000) * 10) / 10, // Convert to km, round to 1 decimal
      duration: Math.round(route.summary.duration / 60), // Convert to minutes
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), // Convert back to [lat, lng]
      mode,
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
}

export function formatRouteInfo(routeInfo: RouteInfo): string {
  const { distance, duration, mode } = routeInfo;

  let modeIcon = "";
  switch (mode) {
    case "driving":
      modeIcon = "🚗";
      break;
    case "walking":
      modeIcon = "🚶";
      break;
    case "cycling":
      modeIcon = "🚴";
      break;
  }

  let timeString = "";
  if (duration < 60) {
    timeString = `${duration}min`;
  } else {
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    timeString = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  return `${modeIcon} ${distance}km • ${timeString}`;
}

// Generate Google Maps URL with specific transport mode
export function getGoogleMapsUrl(
  start: [number, number],
  end: [number, number],
  mode: TransportMode = "driving"
): string {
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  // Google Maps transport mode mapping
  let travelMode = "";
  switch (mode) {
    case "driving":
      travelMode = "driving";
      break;
    case "walking":
      travelMode = "walking";
      break;
    case "cycling":
      travelMode = "bicycling";
      break;
  }

  return `https://www.google.com/maps/dir/${startLat},${startLng}/${endLat},${endLng}/@${endLat},${endLng},15z/data=!4m2!4m1!3e${
    travelMode === "driving" ? "0" : travelMode === "walking" ? "2" : "1"
  }`;
}
