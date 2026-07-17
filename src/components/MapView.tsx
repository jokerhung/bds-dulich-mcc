"use client";

import { Fragment, useRef, useState } from "react";
import { Map, Marker, Popup, type MapRef } from "react-map-gl/mapbox";
import type { Poi } from "@/types/poi";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/categoryColors";

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

// View mặc định (trung tâm Sa Pa) khi chưa có POI nào để fit bounds.
const DEFAULT_VIEW = { longitude: 103.84, latitude: 22.33, zoom: 11 };

// Tính khung bao phủ toàn bộ POI để bản đồ mở lên là thấy hết các địa điểm.
function computeInitialViewState(pois: Poi[]) {
  if (pois.length === 0) {
    return DEFAULT_VIEW;
  }
  let minLng = pois[0].lng;
  let maxLng = pois[0].lng;
  let minLat = pois[0].lat;
  let maxLat = pois[0].lat;
  for (const poi of pois) {
    if (poi.lng < minLng) minLng = poi.lng;
    if (poi.lng > maxLng) maxLng = poi.lng;
    if (poi.lat < minLat) minLat = poi.lat;
    if (poi.lat > maxLat) maxLat = poi.lat;
  }
  return {
    bounds: [
      [minLng, minLat],
      [maxLng, maxLat],
    ] as [[number, number], [number, number]],
    fitBoundsOptions: { padding: 60, maxZoom: 13 },
  };
}

export default function MapView({ pois, selectedPoi, onSelectPoi }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(11);
  // Chỉ tính một lần lúc mount — initialViewState không có tác dụng sau khi map đã khởi tạo.
  const [initialViewState] = useState(() => computeInitialViewState(pois));

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
      initialViewState={initialViewState}
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
          maxWidth="280px"
          closeButton={false}
        >
          <div className="w-64 max-w-full">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold">{selectedPoi.name}</h3>
              <button
                onClick={() => onSelectPoi(null)}
                className="text-black/50 hover:text-black"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {selectedPoi.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPoi.image_url}
                alt={selectedPoi.name}
                className="mt-2 h-28 w-full rounded object-cover"
              />
            )}

            <p className="mt-1 text-xs text-black/60">{CATEGORY_LABELS[selectedPoi.category]}</p>

            {selectedPoi.address && <p className="mt-1 text-xs">{selectedPoi.address}</p>}
            {selectedPoi.description && (
              <p className="mt-1 text-xs text-black/80">{selectedPoi.description}</p>
            )}
            {selectedPoi.price_range && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Giá: </span>
                {selectedPoi.price_range}
              </p>
            )}
            {selectedPoi.phone && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Điện thoại: </span>
                {selectedPoi.phone}
              </p>
            )}
            {selectedPoi.best_season && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Mùa đẹp nhất: </span>
                {selectedPoi.best_season}
              </p>
            )}
            {selectedPoi.rating !== undefined && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Đánh giá: </span>
                {selectedPoi.rating}/5
              </p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
}
