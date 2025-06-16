import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "CMZ-Imadi Area Detail | Ashara Maps",
  description:
    "Detailed street-level interactive map of Saifee Masjid CMZ and Imadi Zone area with real-time navigation to all facilities and points of interest.",
  keywords:
    "CMZ, Imadi Zone, Saifee Masjid, Binny Mills, Chennai, detailed map, navigation, POI, facilities",
  viewport: "width=device-width, initial-scale=1",
  alternates: {
    canonical: "/area/cmz-imadi",
  },
};

// Dynamically import the client component
const CMZImadiClient = dynamic(() => import("./client"));

export default function CMZImadiAreaPage() {
  return <CMZImadiClient />;
}
