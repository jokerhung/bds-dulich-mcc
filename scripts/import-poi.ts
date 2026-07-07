import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import type { Poi, PoiCategory } from "../src/types/poi";

const VALID_CATEGORIES: PoiCategory[] = [
  "ruong_bac_thang",
  "diem_ngam_canh",
  "homestay",
  "nha_hang",
  "le_hoi",
  "dac_san",
];

function isValidCategory(value: unknown): value is PoiCategory {
  return (
    typeof value === "string" &&
    VALID_CATEGORIES.includes(value as PoiCategory)
  );
}

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(value);
}

function main() {
  const workbook = XLSX.readFile("data/poi.xlsx");
  const sheet = workbook.Sheets["POI"];
  if (!sheet) {
    console.error('Không tìm thấy sheet "POI" trong data/poi.xlsx');
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const seenIds = new Set<string>();
  const pois: Poi[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 cho header, +1 vì index bắt đầu từ 0
    const id = toOptionalString(row.id);
    const name = toOptionalString(row.name);
    const category = row.category;
    const lat = Number(row.lat);
    const lng = Number(row.lng);

    if (!id) {
      console.warn(`Dòng ${rowNumber}: thiếu "id", bỏ qua.`);
      return;
    }
    if (seenIds.has(id)) {
      console.warn(`Dòng ${rowNumber}: "id" trùng lặp (${id}), bỏ qua.`);
      return;
    }
    if (!name) {
      console.warn(`Dòng ${rowNumber} (${id}): thiếu "name", bỏ qua.`);
      return;
    }
    if (!isValidCategory(category)) {
      console.warn(
        `Dòng ${rowNumber} (${id}): "category" không hợp lệ (${String(category)}), bỏ qua.`
      );
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn(`Dòng ${rowNumber} (${id}): thiếu hoặc sai "lat"/"lng", bỏ qua.`);
      return;
    }

    seenIds.add(id);
    pois.push({
      id,
      name,
      category,
      commune: toOptionalString(row.commune),
      lat,
      lng,
      address: toOptionalString(row.address),
      description: toOptionalString(row.description),
      price_range: toOptionalString(row.price_range),
      phone: toOptionalString(row.phone),
      best_season: toOptionalString(row.best_season),
      image_url: toOptionalString(row.image_url),
      rating: row.rating !== undefined && row.rating !== "" ? Number(row.rating) : undefined,
    });
  });

  writeFileSync("data/poi.json", JSON.stringify(pois, null, 2), "utf-8");
  console.log(`Đã import ${pois.length}/${rows.length} POI hợp lệ vào data/poi.json`);
}

main();
