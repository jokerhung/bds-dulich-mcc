"use client";

import { useEffect, useRef } from "react";
import { Map, Marker, Popup, type MapRef } from "react-map-gl/mapbox";
import type { Poi } from "@/types/poi";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

// "mapbox" dùng Mapbox GL JS + style của Mapbox (mapbox://...).
// "goong" dùng Goong Maptiles (nhà cung cấp bản đồ Việt Nam), style JSON tương thích
// Mapbox Style Spec nên vẫn chạy được qua cùng thư viện mapbox-gl/react-map-gl,
// không cần đổi package. Xem https://docs.goong.io/maptiles/ (Web SDK - Mapbox GL JS).
const MAP_PROVIDER = process.env.NEXT_PUBLIC_MAP_PROVIDER === "goong" ? "goong" : "mapbox";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const GOONG_MAPTILES_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY;

const MAP_CONFIG =
  MAP_PROVIDER === "goong"
    ? {
        accessToken: GOONG_MAPTILES_KEY,
        mapStyle: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
        missingKeyMessage:
          "Chưa cấu hình NEXT_PUBLIC_GOONG_MAPTILES_KEY trong .env.local — bản đồ không thể hiển thị.",
      }
    : {
        accessToken: MAPBOX_TOKEN,
        mapStyle: "mapbox://styles/mapbox/outdoors-v12",
        missingKeyMessage:
          "Chưa cấu hình NEXT_PUBLIC_MAPBOX_TOKEN trong .env.local — bản đồ không thể hiển thị.",
      };

// Ghi chú: khi số POI trong viewport >50, cân nhắc dùng `supercluster` hoặc
// tính năng cluster built-in của Mapbox GL để nhóm marker. Chưa cần ở MVP
// vì lượng POI hiện tại còn nhỏ.

interface MapViewProps {
  pois: Poi[];
  selectedPoi: Poi | null;
  onSelectPoi: (poi: Poi | null) => void;
}

export default function MapView({ pois, selectedPoi, onSelectPoi }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (selectedPoi) {
      mapRef.current?.flyTo({
        center: [selectedPoi.lng, selectedPoi.lat],
        zoom: 14,
        duration: 800,
      });
    }
  }, [selectedPoi]);

  if (!MAP_CONFIG.accessToken) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/5 p-6 text-center text-sm text-black/60">
        {MAP_CONFIG.missingKeyMessage}
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAP_CONFIG.accessToken}
      initialViewState={{
        longitude: 104.1,
        latitude: 21.85,
        zoom: 11,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_CONFIG.mapStyle}
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
