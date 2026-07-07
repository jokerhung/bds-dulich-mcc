"use client";

import type { Poi, PoiCategory } from "@/types/poi";
import { CATEGORY_LABELS } from "@/lib/categoryColors";

interface FilterState {
  category: PoiCategory | "";
  commune: string;
}

interface PoiFilterBarProps {
  pois: Poi[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function PoiFilterBar({ pois, filters, onFilterChange }: PoiFilterBarProps) {
  const communes = Array.from(
    new Set(pois.map((p) => p.commune).filter((c): c is string => !!c))
  ).sort();

  return (
    <div className="flex flex-wrap gap-3 border-b border-black/10 p-3">
      <select
        value={filters.category}
        onChange={(e) =>
          onFilterChange({ ...filters, category: e.target.value as PoiCategory | "" })
        }
        className="rounded border border-black/20 px-2 py-1 text-sm"
      >
        <option value="">Tất cả loại điểm</option>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={filters.commune}
        onChange={(e) => onFilterChange({ ...filters, commune: e.target.value })}
        className="rounded border border-black/20 px-2 py-1 text-sm"
      >
        <option value="">Tất cả xã</option>
        {communes.map((commune) => (
          <option key={commune} value={commune}>
            {commune}
          </option>
        ))}
      </select>
    </div>
  );
}

export type { FilterState };
