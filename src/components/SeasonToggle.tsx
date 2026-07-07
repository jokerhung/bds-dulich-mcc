"use client";

export type Season = "all" | "mua_nuoc_do" | "mua_lua_chin";

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "all", label: "Tất cả mùa" },
  { value: "mua_nuoc_do", label: "Mùa nước đổ (Thg5-Thg6)" },
  { value: "mua_lua_chin", label: "Mùa lúa chín (Thg9-Thg10)" },
];

interface SeasonToggleProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
}

export default function SeasonToggle({ season, onSeasonChange }: SeasonToggleProps) {
  return (
    <div className="flex gap-2 border-b border-black/10 p-3">
      {SEASON_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSeasonChange(opt.value)}
          className={`rounded px-3 py-1 text-sm ${
            season === opt.value
              ? "bg-black text-white"
              : "border border-black/20 text-black/70"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function matchesSeason(bestSeason: string | undefined, season: Season): boolean {
  if (season === "all") return true;
  if (!bestSeason) return false;
  const normalized = bestSeason.toLowerCase();
  if (season === "mua_nuoc_do") {
    return normalized.includes("thg5") || normalized.includes("thg6");
  }
  if (season === "mua_lua_chin") {
    return normalized.includes("thg9") || normalized.includes("thg10");
  }
  return true;
}
