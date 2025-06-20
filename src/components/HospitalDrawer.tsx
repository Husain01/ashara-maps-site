"use client";

import { useState, useEffect, useCallback } from "react";
import { POI, zones } from "@/data/zones";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Phone, MapPin, Clock, Users } from "lucide-react";

interface HospitalDrawerProps {
  hospital: POI | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation?: [number, number];
}

export default function HospitalDrawer({
  hospital,
  isOpen,
  onClose,
  userLocation,
}: HospitalDrawerProps) {
  const [selectedZone, setSelectedZone] = useState<string>("");

  const getClosestZone = useCallback((): string | null => {
    if (!userLocation || !hospital?.serviceZones) return null;

    let closestZone = null;
    let minDistance = Infinity;

    hospital.serviceZones.forEach((zoneId) => {
      const zone = zones.find((z) => z.id === zoneId);
      if (zone) {
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          zone.coordinates[0],
          zone.coordinates[1]
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestZone = zoneId;
        }
      }
    });

    return closestZone;
  }, [userLocation, hospital?.serviceZones]);

  // Auto-select closest zone when drawer opens
  useEffect(() => {
    if (hospital && isOpen && userLocation && !selectedZone) {
      const closestZone = getClosestZone();
      if (closestZone) {
        setSelectedZone(closestZone);
      }
    }
  }, [hospital, isOpen, userLocation, selectedZone, getClosestZone]);

  // Reset selection when hospital changes
  useEffect(() => {
    if (hospital) {
      setSelectedZone("");
    }
  }, [hospital?.id]);

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

  if (!hospital) return null;

  const selectedZoneData = zones.find((z) => z.id === selectedZone);
  const coordinators = selectedZone
    ? hospital.coordinators?.[selectedZone]
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto p-6">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="text-2xl">🏥</div>
            </div>
            <div>
              <SheetTitle className="text-xl">{hospital.name}</SheetTitle>
              <SheetDescription className="text-sm text-gray-600">
                Multi-zone hospital facility
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Hospital Details */}
          <div className="space-y-3">
            {hospital.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {hospital.address}
                </p>
              </div>
            )}

            {hospital.description && (
              <div className="flex items-start gap-3">
                <div className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0">
                  ℹ️
                </div>
                <p className="text-sm text-gray-700">{hospital.description}</p>
              </div>
            )}

            {hospital.hours && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <p className="text-sm text-gray-700">{hospital.hours}</p>
              </div>
            )}
          </div>

          {/* Service Zones */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Service Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {hospital.serviceZones?.map((zoneId) => {
                const zone = zones.find((z) => z.id === zoneId);
                return zone ? (
                  <Badge key={zoneId} variant="secondary" className="text-xs">
                    {zone.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          {/* Zone Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Select Your Zone for Coordinator Information
            </h3>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your zone..." />
              </SelectTrigger>
              <SelectContent>
                {hospital.serviceZones?.map((zoneId) => {
                  const zone = zones.find((z) => z.id === zoneId);
                  return zone ? (
                    <SelectItem key={zoneId} value={zoneId}>
                      <div className="flex items-center gap-2">
                        <span>{zone.name}</span>
                        {userLocation && (
                          <span className="text-xs text-gray-500">
                            (
                            {calculateDistance(
                              userLocation[0],
                              userLocation[1],
                              zone.coordinates[0],
                              zone.coordinates[1]
                            ).toFixed(1)}{" "}
                            km)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ) : null;
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Coordinator Information */}
          {selectedZoneData && coordinators && coordinators.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">
                Coordinators for {selectedZoneData.name}
              </h3>
              <div className="space-y-3">
                {coordinators.map((coordinator, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md p-3 border border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {coordinator.name}
                        </h4>
                        {coordinator.role && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {coordinator.role}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => {
                          window.open(`tel:${coordinator.phone}`, "_self");
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    </div>
                    <p className="text-sm text-blue-600 mt-2 font-mono">
                      {coordinator.phone}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedZone && (!coordinators || coordinators.length === 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                No coordinators available for the selected zone.
              </p>
            </div>
          )}

          {/* Navigation Button */}
          <div className="pt-6 border-t border-gray-200 mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
              size="lg"
              onClick={() => {
                const url =
                  hospital.googleMapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${hospital.coordinates[0]},${hospital.coordinates[1]}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
            >
              <Navigation className="h-5 w-5 mr-2" />
              Navigate with Google Maps
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
