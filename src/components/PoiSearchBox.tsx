"use client";

import { useMemo, useState } from "react";
import type { Poi } from "@/types/poi";
import { stripDiacritics } from "@/lib/text";

interface PoiSearchBoxProps {
  pois: Poi[];
  onSelectPoi: (poi: Poi) => void;
}

export default function PoiSearchBox({ pois, onSelectPoi }: PoiSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = stripDiacritics(query.trim().toLowerCase());
    if (!q) return [];
    return pois
      .filter((p) => stripDiacritics(p.name.toLowerCase()).includes(q))
      .slice(0, 8);
  }, [pois, query]);

  function handleSelect(poi: Poi) {
    onSelectPoi(poi);
    setQuery(poi.name);
    setFocused(false);
  }

  return (
    <div className="absolute left-3 top-3 z-10 w-72">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Tìm điểm đến..."
          className="w-full rounded border border-black/10 bg-white/95 px-3 py-2 pr-8 text-sm shadow"
        />
        {query && (
          <button
            type="button"
            onMouseDown={() => setQuery("")}
            aria-label="Xoá tìm kiếm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
          >
            ×
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded border border-black/10 bg-white/95 shadow">
          {suggestions.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                onMouseDown={() => handleSelect(poi)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5"
              >
                {poi.name}
                {poi.commune && <span className="text-black/40"> — {poi.commune}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
