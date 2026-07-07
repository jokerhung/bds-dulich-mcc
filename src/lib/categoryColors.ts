import type { PoiCategory } from "@/types/poi";

export const CATEGORY_LABELS: Record<PoiCategory, string> = {
  ruong_bac_thang: "Ruộng bậc thang",
  diem_ngam_canh: "Điểm ngắm cảnh",
  homestay: "Homestay",
  nha_hang: "Nhà hàng",
  le_hoi: "Lễ hội",
  dac_san: "Đặc sản",
};

export const CATEGORY_COLORS: Record<PoiCategory, string> = {
  ruong_bac_thang: "#ca8a04", // vàng lúa
  diem_ngam_canh: "#0891b2", // xanh trời/mây
  homestay: "#16a34a", // xanh lá
  nha_hang: "#dc2626", // đỏ
  le_hoi: "#c026d3", // tím hồng
  dac_san: "#ea580c", // cam
};
