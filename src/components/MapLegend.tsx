import type { Poi, PoiCategory } from "@/types/poi";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/categoryColors";

interface MapLegendProps {
  pois: Poi[];
  activeCategories: Set<PoiCategory>;
  onToggleCategory: (category: PoiCategory) => void;
}

export default function MapLegend({ pois, activeCategories, onToggleCategory }: MapLegendProps) {
  const categoriesInUse = Array.from(new Set(pois.map((p) => p.category)));

  if (categoriesInUse.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-3 z-10 rounded border border-black/10 bg-white/95 p-3 shadow">
      <ul className="space-y-1">
        {categoriesInUse.map((category) => (
          <li key={category}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={activeCategories.has(category)}
                onChange={() => onToggleCategory(category)}
              />
              <span
                className="h-3 w-3 flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              {CATEGORY_LABELS[category]}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
