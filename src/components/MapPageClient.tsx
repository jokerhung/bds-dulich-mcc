"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Poi, PoiCategory } from "@/types/poi";
import MapView from "./MapView";
import MapLegend from "./MapLegend";
import PoiDetailCard from "./PoiDetailCard";
import ChatWidget from "./ChatWidget";

interface MapPageClientProps {
  pois: Poi[];
}

export default function MapPageClient({ pois }: MapPageClientProps) {
  const router = useRouter();
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<PoiCategory>>(
    () => new Set(pois.map((p) => p.category))
  );

  const visiblePois = useMemo(
    () => pois.filter((p) => activeCategories.has(p.category)),
    [pois, activeCategories]
  );

  function handleToggleCategory(category: PoiCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen w-full">
      <div className="relative flex-1">
        <MapView pois={visiblePois} selectedPoi={selectedPoi} onSelectPoi={setSelectedPoi} />
        <MapLegend
          pois={pois}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
        />
        <PoiDetailCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      </div>

      <div className="flex w-96 flex-col">
        <div className="flex items-center justify-between border-b border-black/10 p-3">
          <span className="font-semibold">Chợ Mù - Trợ lý du lịch</span>
          <button onClick={handleLogout} className="text-xs text-black/40 hover:text-black">
            Đăng xuất
          </button>
        </div>
        <div className="flex-1">
          <ChatWidget hideHeader />
        </div>
      </div>
    </div>
  );
}
