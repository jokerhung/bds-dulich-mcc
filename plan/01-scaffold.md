# Giai đoạn 1 — Scaffold project

## Mục tiêu
Có project Next.js chạy được (`npm run dev` render trang trống), đúng cấu trúc thư mục
trong CLAUDE.md, đầy đủ dependencies và types nền tảng.

## Việc làm

1. Khởi tạo Next.js trong thư mục hiện tại (đã có `CLAUDE.md`, chưa có `package.json`):
   ```
   npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
   ```
   Nếu CLI hỏi ghi đè `CLAUDE.md`/git — chọn giữ nguyên các file đã có, không overwrite.

2. Cài dependencies:
   ```
   npm install react-map-gl mapbox-gl xlsx gray-matter openai bcryptjs jose
   npm install -D @types/mapbox-gl @types/bcryptjs
   ```

3. Tạo `src/types/poi.ts`:
   - `type PoiCategory = "ruong_bac_thang" | "diem_ngam_canh" | "homestay" | "nha_hang" | "le_hoi" | "dac_san"`
   - `interface Poi { id: string; name: string; category: PoiCategory; commune?: string; lat: number; lng: number; address?: string; description?: string; price_range?: string; phone?: string; best_season?: string; image_url?: string; rating?: number }`

4. Tạo thư mục rỗng cần cho giai đoạn sau (để cấu trúc khớp CLAUDE.md ngay từ đầu):
   `data/`, `content/knowledge/`, `scripts/`.

5. Tạo `.env.local.example` với các key liệt kê trong CLAUDE.md, giá trị rỗng/placeholder:
   ```
   OPENAI_API_KEY=
   OPENAI_API_URL=https://api.openai.com/v1
   NEXT_PUBLIC_MAPBOX_TOKEN=
   ADMIN_USERNAME=
   ADMIN_PASSWORD_HASH=
   SESSION_SECRET=
   ```
   Xác nhận `.env.local` đã có trong `.gitignore` (mặc định của create-next-app đã bao gồm `.env*.local`).

6. Thêm import CSS của `mapbox-gl` (`mapbox-gl/dist/mapbox-gl.css`) — sẽ dùng ở giai đoạn 5, nhưng
   có thể để `globals.css` `@import` sẵn để tránh quên.

## Tiêu chí xong
- `npm run dev` chạy, trang mặc định không lỗi TypeScript.
- `npm run build` pass.
- Cấu trúc thư mục khớp phần "Cấu trúc thư mục" trong CLAUDE.md (trừ các file sẽ tạo ở giai đoạn sau).
