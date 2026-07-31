
// /src/app/checkout/_components/LocationPicker.tsx (VERIFIED - NO CHANGES NEEDED)

"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng, Map } from "leaflet";
import { toast } from "react-hot-toast";

// Note: This component assumes that marker-icon.png and marker-shadow.png
// are placed in the /public/leaflet/ folder and are handled by a global CSS import.

// Internal component to handle map events
interface LocationMarkerProps {
  onPositionChange: (pos: LatLng) => void;
  onInitialLocationFound: () => void;
}

function LocationMarker({
  onPositionChange,
  onInitialLocationFound,
}: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const hasLocated = useRef(false);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng);
    },
    locationfound(e) {
      if (!hasLocated.current) {
        setPosition(e.latlng);
        onPositionChange(e.latlng);
        map.flyTo(e.latlng, 15);
        onInitialLocationFound();
        hasLocated.current = true;
      }
    },
    locationerror(e) {
      if (!hasLocated.current) {
        toast.error("Could not auto-detect location.");
        console.error("Location error:", e.message);
        hasLocated.current = true;
      }
    },
  });

  useEffect(() => {
    if (!hasLocated.current) {
      map.locate();
    }
  }, [map]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => onPositionChange(e.target.getLatLng()),
      }}
    />
  ) : null;
}

// Main Exported Component
export default function LocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [initialLocationFound, setInitialLocationFound] = useState(false);

  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }
  }, [mapInstance]);

  return (
    <MapContainer
      ref={setMapInstance}
      center={[30.3753, 69.3451]} // Default center of Pakistan
      zoom={5}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        onPositionChange={(pos) => onLocationSelect(pos.lat, pos.lng)}
        onInitialLocationFound={() => {
          if (!initialLocationFound) {
            toast.success("Location auto-detected successfully!");
            setInitialLocationFound(true);
          }
        }}
      />
    </MapContainer>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This component is self-contained and focuses on a single responsibility (map-based location picking). It does not need modification for our authentication or verification flow.
