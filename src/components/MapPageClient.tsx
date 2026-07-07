"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Poi, PoiCategory } from "@/types/poi";
import { filterPois } from "@/lib/poi";
import MapView from "./MapView";
import PoiFilterBar, { type FilterState } from "./PoiFilterBar";
import PoiDetailCard from "./PoiDetailCard";
import SeasonToggle, { matchesSeason, type Season } from "./SeasonToggle";
import ChatWidget from "./ChatWidget";

interface MapPageClientProps {
  pois: Poi[];
}

export default function MapPageClient({ pois }: MapPageClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({ category: "", commune: "" });
  const [season, setSeason] = useState<Season>("all");
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  const visiblePois = useMemo(() => {
    const byFilters = filterPois(pois, {
      category: (filters.category as PoiCategory) || null,
      commune: filters.commune || null,
    });
    return byFilters.filter((p) => matchesSeason(p.best_season, season));
  }, [pois, filters, season]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="flex items-center justify-between border-b border-black/10 p-3">
        <h1 className="font-semibold">Bản đồ du lịch Mù Cang Chải</h1>
        <button onClick={handleLogout} className="text-sm text-black/60 hover:text-black">
          Đăng xuất
        </button>
      </header>

      <PoiFilterBar pois={pois} filters={filters} onFilterChange={setFilters} />
      <SeasonToggle season={season} onSeasonChange={setSeason} />

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MapView
            pois={visiblePois}
            selectedPoi={selectedPoi}
            onSelectPoi={setSelectedPoi}
          />
          <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
        </div>
        <div className="w-96">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
