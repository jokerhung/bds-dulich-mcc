"use client";

import type { Poi } from "@/types/poi";
import { CATEGORY_LABELS } from "@/lib/categoryColors";

interface PoiDetailCardProps {
  poi: Poi | null;
  onClose: () => void;
}

export default function PoiDetailCard({ poi, onClose }: PoiDetailCardProps) {
  if (!poi) return null;

  return (
    <div className="absolute right-3 top-3 z-10 w-72 rounded-lg border border-black/10 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{poi.name}</h3>
        <button onClick={onClose} className="text-black/50 hover:text-black">
          ×
        </button>
      </div>

      {poi.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poi.image_url}
          alt={poi.name}
          className="mt-2 h-32 w-full rounded object-cover"
        />
      )}

      <p className="mt-2 text-xs text-black/60">{CATEGORY_LABELS[poi.category]}</p>

      {poi.address && <p className="mt-1 text-sm">{poi.address}</p>}
      {poi.description && <p className="mt-2 text-sm text-black/80">{poi.description}</p>}
      {poi.price_range && (
        <p className="mt-2 text-sm">
          <span className="font-medium">Giá: </span>
          {poi.price_range}
        </p>
      )}
      {poi.phone && (
        <p className="mt-1 text-sm">
          <span className="font-medium">Điện thoại: </span>
          {poi.phone}
        </p>
      )}
      {poi.best_season && (
        <p className="mt-1 text-sm">
          <span className="font-medium">Mùa đẹp nhất: </span>
          {poi.best_season}
        </p>
      )}
      {poi.rating !== undefined && (
        <p className="mt-1 text-sm">
          <span className="font-medium">Đánh giá: </span>
          {poi.rating}/5
        </p>
      )}
    </div>
  );
}
