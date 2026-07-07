export type PoiCategory =
  | "ruong_bac_thang"
  | "diem_ngam_canh"
  | "homestay"
  | "nha_hang"
  | "le_hoi"
  | "dac_san";

export interface Poi {
  id: string;
  name: string;
  category: PoiCategory;
  commune?: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  price_range?: string;
  phone?: string;
  best_season?: string;
  image_url?: string;
  rating?: number;
}
