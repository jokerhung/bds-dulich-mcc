# Giai đoạn 3 — POI pipeline (Excel → JSON → API)

## Mục tiêu
`data/poi.xlsx` mẫu với dữ liệu thật về Sa Pa, import ra `data/poi.json` hợp lệ,
`GET /api/poi` trả đúng dữ liệu và filter được.

## Việc làm

1. Tạo `data/poi.xlsx`, sheet tên `POI`, 5–10 dòng dữ liệu thật (tọa độ thật khu vực Sa Pa,
   ví dụ Fansipan, Cát Cát, Tả Van, Mường Hoa, chợ Sa Pa, đặc sản), đủ cột theo schema trong
   CLAUDE.md (`id, name, category, commune, lat, lng, address, description, price_range, phone,
   best_season, image_url, rating`). Tạo bằng script Node một lần (dùng package `xlsx` để viết file)
   thay vì tay — dễ tái tạo và review dạng text trước khi ghi ra `.xlsx`.

2. `scripts/import-poi.ts`:
   - Đọc `data/poi.xlsx` bằng `xlsx`, lấy sheet `POI` (`workbook.Sheets["POI"]`), `sheet_to_json`.
   - Validate từng dòng: bắt buộc `id` (duy nhất trong file), `name`, `category` (phải thuộc enum `PoiCategory`),
     `lat`, `lng` (number hợp lệ). Dòng thiếu/sai → `console.warn` cảnh báo rõ dòng nào, lý do gì, rồi bỏ qua
     (không throw, không dừng cả script trừ khi *toàn bộ* sheet lỗi).
   - Ghi kết quả hợp lệ ra `data/poi.json` (`JSON.stringify(pois, null, 2)`), dạng `Poi[]` từ `src/types/poi.ts`.
   - Chạy bằng `ts-node` hoặc `tsx` — thêm devDependency tương ứng nếu chưa có sẵn cách chạy `.ts` script.

3. `package.json`: thêm script `"import:poi": "tsx scripts/import-poi.ts"` (hoặc `ts-node`, tuỳ cái nào
   cài được nhanh hơn trong môi trường này).

4. Chạy `npm run import:poi`, review `data/poi.json` sinh ra — đối chiếu số dòng hợp lệ với số dòng
   trong Excel, xác nhận không có POI trùng `id`.

5. `src/lib/poi.ts`:
   - `getAllPois(): Poi[]` — đọc `data/poi.json` (import trực tiếp hoặc `fs.readFileSync` + `JSON.parse`;
     ưu tiên import tĩnh vì file được build cùng app, tránh đọc fs ở runtime serverless nếu path phức tạp).
   - `filterPois(pois, { category, commune }): Poi[]` — lọc theo `category` chính xác, `commune` so khớp
     không phân biệt hoa/thường (POI có thể ghi tên xã không đồng nhất dấu).

6. `src/app/api/poi/route.ts` (GET):
   - Đọc query `category`, `commune` từ `request.nextUrl.searchParams`.
   - Gọi `getAllPois()` + `filterPois`, trả `{ data: Poi[] }`.

## Tiêu chí xong
- `data/poi.json` tồn tại, đúng type `Poi[]`, không có dòng thiếu `lat/lng/category`.
- `GET /api/poi` không query → trả toàn bộ POI.
- `GET /api/poi?category=homestay` → chỉ trả homestay.
- `GET /api/poi?commune=La+Pán+Tẩn` → lọc đúng theo xã (test cả khi gõ thiếu dấu nếu có xử lý normalize,
  nếu không xử lý thì ghi rõ trong code/README là so khớp chính xác).
- Sửa thử một dòng trong `data/poi.xlsx`, chạy lại `npm run import:poi`, xác nhận `data/poi.json` cập nhật
  đúng (chứng minh quy trình biên tập qua Excel hoạt động như thiết kế).
