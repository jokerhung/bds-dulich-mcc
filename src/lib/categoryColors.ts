import type { PoiCategory } from "@/types/poi";

export const CATEGORY_LABELS: Record<PoiCategory, string> = {
  diem_ngam_canh: "Điểm du lịch",
  homestay: "Khách Sạn/Homestay",
  nha_hang: "Nhà hàng",
};

export const CATEGORY_COLORS: Record<PoiCategory, string> = {
  diem_ngam_canh: "#ea580c", // cam
  homestay: "#16a34a", // xanh lá
  nha_hang: "#eab308", // vàng
};
