"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Map, Marker, Popup, type MapRef } from "react-map-gl/mapbox";
import type { Poi } from "@/types/poi";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

// Từ mức zoom này trở lên mới hiện tên địa điểm dưới marker, tránh rối bản đồ khi zoom xa.
const LABEL_MIN_ZOOM = 13;

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
  const [zoom, setZoom] = useState(11);

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
      onZoom={(e) => setZoom(e.viewState.zoom)}
    >
      {pois.map((poi) => (
        <Fragment key={poi.id}>
          <Marker
            longitude={poi.lng}
            latitude={poi.lat}
            color={CATEGORY_COLORS[poi.category]}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectPoi(poi);
            }}
          />
          {zoom >= LABEL_MIN_ZOOM && (
            <Marker longitude={poi.lng} latitude={poi.lat} anchor="top" offset={[0, 2]}>
              <span className="pointer-events-none whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium shadow">
                {poi.name}
              </span>
            </Marker>
          )}
        </Fragment>
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
