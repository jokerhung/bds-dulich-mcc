import poiData from "../../data/poi.json";
import type { Poi, PoiCategory } from "@/types/poi";

export function getAllPois(): Poi[] {
  return poiData as Poi[];
}

export function filterPois(
  pois: Poi[],
  filters: { category?: PoiCategory | string | null; commune?: string | null }
): Poi[] {
  return pois.filter((poi) => {
    if (filters.category && poi.category !== filters.category) {
      return false;
    }
    if (
      filters.commune &&
      poi.commune?.toLowerCase() !== filters.commune.toLowerCase()
    ) {
      return false;
    }
    return true;
  });
}
