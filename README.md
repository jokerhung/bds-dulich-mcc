# Bản đồ số & Chatbot du lịch Mù Cang Chải

Ứng dụng Next.js (App Router) gồm bản đồ tương tác (pan/zoom, marker theo loại điểm đến) và
chatbot AI trả lời câu hỏi du khách dựa trên knowledge base Markdown trong repo. Chi tiết
quyết định kỹ thuật và spec đầy đủ xem tại [CLAUDE.md](CLAUDE.md).

## Tính năng chính

- Bản đồ thật (Mapbox GL hoặc Goong Maptiles — chọn qua env), marker phân loại theo màu.
- Ô tìm kiếm POI dạng float (góc trên-trái), gợi ý autocomplete, bản đồ tự bay đến vị trí khi chọn.
- Menu bật/tắt từng loại điểm (layer) dạng float (góc dưới-trái).
- Panel chi tiết điểm đến khi click marker.
- Chatbot "Chợ Mù" trả lời dựa trên `content/knowledge/*.md`, hiển thị nguồn đã dùng, render markdown.
- Đăng nhập 1 tài khoản admin, session cookie JWT, middleware chặn toàn bộ route khi chưa đăng nhập.
- Dữ liệu điểm đến (POI) biên tập bằng Excel, import vào app qua script.

## Yêu cầu môi trường

- Node.js 20+
- npm

## Cài đặt & chạy local

```bash
npm install
cp .env.local.example .env.local   # rồi điền giá trị, xem bảng biến môi trường bên dưới
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) — sẽ redirect sang `/login` nếu chưa đăng nhập.

## Scripts

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy dev server (Turbopack) |
| `npm run build` | Build production, đồng thời kiểm tra lỗi TypeScript |
| `npm run start` | Chạy server đã build |
| `npm run lint` | Chạy ESLint |
| `npm run import:poi` | Đọc `data/poi.xlsx` → sinh lại `data/poi.json` |

## Biến môi trường (`.env.local`)

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `ADMIN_USERNAME` | có | Tên đăng nhập admin duy nhất |
| `ADMIN_PASSWORD_HASH` | có | Bcrypt hash — tạo bằng `node scripts/hash-password.ts "mật khẩu"`. **Phải escape mọi ký tự `$` thành `\$`** (Next.js tự expand biến `$NAME` trong `.env.local`, không escape sẽ làm hỏng hash) |
| `SESSION_SECRET` | có | Chuỗi ngẫu nhiên ≥32 ký tự để ký JWT session |
| `NEXT_PUBLIC_MAP_PROVIDER` | không | `mapbox` (mặc định) hoặc `goong` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | khi dùng mapbox | Access token từ [mapbox.com](https://account.mapbox.com) |
| `NEXT_PUBLIC_GOONG_MAPTILES_KEY` | khi dùng goong | **Maptiles Key** (không phải API Key REST thường) từ [account.goong.io](https://account.goong.io) |
| `OPENAI_API_KEY` | có (để chat hoạt động) | Không thiếu vẫn chạy được app, chat sẽ trả lỗi graceful tiếng Việt |
| `OPENAI_API_URL` | không | Mặc định `https://api.openai.com/v1`, đổi khi dùng proxy/provider tương thích OpenAI API |
| `OPENAI_MODEL` | không | Mặc định `gpt-4.1-mini`, kiểm tra model có sẵn trong tài khoản/provider trước khi đổi |

Thiếu `NEXT_PUBLIC_MAPBOX_TOKEN`/`NEXT_PUBLIC_GOONG_MAPTILES_KEY` hay `OPENAI_API_KEY` không làm
app crash — bản đồ/chat sẽ hiện thông báo lỗi tiếng Việt thay vì lỗi kỹ thuật.

## Quản lý dữ liệu điểm đến (POI)

**Không sửa tay `data/poi.json`** — file này được sinh tự động từ `data/poi.xlsx`.

Quy trình đúng:
1. Sửa sheet `POI` trong `data/poi.xlsx` (thêm/sửa/xoá dòng).
2. Chạy `npm run import:poi` — script validate và ghi lại `data/poi.json`.
3. Refresh trình duyệt để thấy thay đổi trên bản đồ.

Cột `category` chỉ nhận 3 giá trị: `diem_ngam_canh`, `homestay`, `nha_hang`. Dòng thiếu
`id`/`name`/`category` hợp lệ/`lat`/`lng` sẽ bị bỏ qua kèm cảnh báo trong terminal.

## Quản lý knowledge base chatbot

Thêm/sửa nội dung trong `content/knowledge/*.md` (frontmatter `title` + `tags`, nội dung Markdown
tự do bằng tiếng Việt). Không cần restart server hay chạy script — `lib/knowledge.ts` đọc trực
tiếp các file này mỗi khi có câu hỏi mới (có cache trong bộ nhớ, restart dev server nếu sửa mà
không thấy cập nhật). `tong-quan.md` là file fallback khi không câu hỏi nào khớp từ khóa.

## Đổi mật khẩu admin

```bash
node scripts/hash-password.ts "mật khẩu mới"
```

Dán kết quả vào `ADMIN_PASSWORD_HASH` trong `.env.local` (nhớ escape `$`), restart server.

## Cấu trúc thư mục

Xem chi tiết đầy đủ trong [CLAUDE.md](CLAUDE.md#cấu-trúc-thư-mục). Tóm tắt:

```
src/
├── app/            # Route Handlers (api/*) + page.tsx, login/page.tsx
├── components/      # MapView, MapLegend, PoiSearchBox, PoiDetailCard, ChatWidget, LoginForm...
├── lib/             # poi.ts, knowledge.ts, openai.ts, auth.ts, categoryColors.ts, text.ts
└── types/poi.ts      # Poi, PoiCategory
data/                # poi.xlsx (nguồn), poi.json (sinh ra, không sửa tay)
content/knowledge/   # Knowledge base .md cho chatbot
scripts/             # import-poi.ts, hash-password.ts
```

## Kế hoạch triển khai

Xem [plan/](plan/00-overview.md) để biết checklist các giai đoạn đã implement và tiêu chí test
end-to-end.
