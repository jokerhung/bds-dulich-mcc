"use client";

import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { Poi } from "@/types/poi";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Ghi chú: khi số POI trong viewport >50, cân nhắc dùng `supercluster` hoặc
// tính năng cluster built-in của Mapbox GL để nhóm marker. Chưa cần ở MVP
// vì lượng POI hiện tại còn nhỏ.

interface MapViewProps {
  pois: Poi[];
  selectedPoi: Poi | null;
  onSelectPoi: (poi: Poi | null) => void;
}

export default function MapView({ pois, selectedPoi, onSelectPoi }: MapViewProps) {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/5 p-6 text-center text-sm text-black/60">
        Chưa cấu hình NEXT_PUBLIC_MAPBOX_TOKEN trong .env.local — bản đồ không thể hiển thị.
      </div>
    );
  }

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 104.1,
        latitude: 21.85,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
    >
      {pois.map((poi) => (
        <Marker
          key={poi.id}
          longitude={poi.lng}
          latitude={poi.lat}
          color={CATEGORY_COLORS[poi.category]}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelectPoi(poi);
          }}
        />
      ))}

      {selectedPoi && (
        <Popup
          longitude={selectedPoi.lng}
          latitude={selectedPoi.lat}
          onClose={() => onSelectPoi(null)}
          offset={12}
        >
          <span className="text-sm font-medium">{selectedPoi.name}</span>
        </Popup>
      )}
    </Map>
  );
}
