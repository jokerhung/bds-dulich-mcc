# CLAUDE.md — Bản đồ số du lịch & Chatbot Mù Cang Chải

Tài liệu này hướng dẫn Claude Code (hoặc bất kỳ ai code tiếp) xây dựng ứng dụng Next.js
gồm bản đồ kéo/zoom thật + chatbot AI cho du lịch Mù Cang Chải, Yên Bái.

## Mục tiêu sản phẩm

- Bản đồ tương tác thật (pan/zoom/marker cluster), **không dùng tile hoặc API của OpenStreetMap**.
- Dữ liệu điểm đến (POI: ruộng bậc thang, điểm ngắm cảnh, nhà hàng, homestay, lễ hội, đặc sản)
  được biên tập trong file Excel, import vào app qua script.
- Chatbot trả lời câu hỏi du khách, lấy kiến thức nền từ các file Markdown trong repo
  (không hardcode trong code, không gọi API ngoài để tra cứu).
- Chạy full-stack trong một project Next.js duy nhất (FE + BE dùng App Router + Route Handlers).

## Quyết định kỹ thuật (đã chốt, không cần hỏi lại)

| Vấn đề | Quyết định | Lý do |
|---|---|---|
| Nền bản đồ | **Mapbox GL JS** (qua `react-map-gl`) | Free tier ~50k lượt tải/tháng, pan/zoom mượt, không lệ thuộc OSM. Có thể đổi sang **Vietmap GL** (`@vietmap/vietmap-gl-js`, API tương thích Mapbox style) nếu muốn nhà cung cấp Việt Nam — chỉ cần đổi style URL + token trong `MapView.tsx`. |
| Nguồn POI | File `data/poi.xlsx` | Người biên tập không cần biết code, chỉ sửa Excel rồi chạy lại script import. |
| Lưu trữ POI sau import | `data/poi.json` (file tĩnh, generate từ Excel) | Quy mô demo nhỏ (vài chục - vài trăm điểm), không cần DB. Nếu sau này cần CRUD qua UI thì thay bằng SQLite/Postgres + Prisma. |
| Knowledge base chatbot | `content/knowledge/*.md` | Biên tập viên viết bằng Markdown thường, không cần vector DB ở MVP. |
| Truy hồi nội dung cho chatbot | Keyword scoring đơn giản trong `lib/knowledge.ts`, chọn top-3 file liên quan nhất rồi đưa vào system prompt | Đủ chính xác ở quy mô vài chục file .md, tránh phải setup embeddings/pinecone cho một demo. |
| Model chat | OpenAI API (`gpt-4.1-mini` hoặc `gpt-4o-mini` — kiểm tra model hiện có trong tài khoản trước khi code) qua `openai` npm package, gọi từ Route Handler phía server | Giữ `OPENAI_API_KEY` ở server, không lộ ra client. |
| Đăng nhập | 1 tài khoản admin duy nhất, `username` + `password_hash` (bcrypt) lưu trong `.env.local`, session bằng cookie JWT ký bằng `jose` | Đủ cho demo/che chắn trước công khai, không cần DB. Đổi mật khẩu = tạo lại hash + sửa `.env.local` + restart server (hạn chế cố hữu, đã biết trước). Nếu cần nhiều tài khoản/vai trò → phải chuyển sang DB, không dùng cách này. |

## Cấu trúc thư mục

```
mucangchai-app/
├── CLAUDE.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── .env.local.example
├── middleware.ts                # chặn mọi route trừ /login và /api/auth/login khi chưa có session hợp lệ
├── data/
│   ├── poi.xlsx                 # nguồn biên tập (không commit dữ liệu nhạy cảm)
│   └── poi.json                 # sinh ra bởi scripts/import-poi.ts, KHÔNG sửa tay
├── content/
│   └── knowledge/
│       ├── mua-lua.md
│       ├── duong-di.md
│       ├── homestay-va-luu-tru.md
│       ├── le-hoi-va-su-kien.md
│       └── dac-san.md
├── scripts/
│   ├── import-poi.ts            # đọc data/poi.xlsx -> viết data/poi.json
│   └── hash-password.ts         # tiện ích tạo bcrypt hash: node scripts/hash-password.ts "mật khẩu"
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # trang chính: bản đồ + chat (yêu cầu đã đăng nhập)
│   │   ├── login/
│   │   │   └── page.tsx          # form đăng nhập, Client Component
│   │   ├── globals.css
│   │   └── api/
│   │       ├── poi/route.ts      # GET danh sách POI (filter category/commune)
│   │       ├── chat/route.ts     # POST tin nhắn -> gọi model chat, trả lời
│   │       └── auth/
│   │           ├── login/route.ts    # POST xác thực username/password, set cookie session
│   │           └── logout/route.ts   # POST xoá cookie session
│   ├── components/
│   │   ├── MapView.tsx           # Mapbox GL, marker theo category, popup
│   │   ├── PoiFilterBar.tsx      # bộ lọc theo category/xã
│   │   ├── PoiDetailCard.tsx     # panel chi tiết khi click marker
│   │   ├── ChatWidget.tsx        # khung chat, gọi /api/chat
│   │   ├── SeasonToggle.tsx      # chuyển hiển thị mùa cấy/mùa gặt (đổi filter POI theo best_season)
│   │   └── LoginForm.tsx         # form username/password
│   ├── lib/
│   │   ├── poi.ts                # đọc/lọc data/poi.json
│   │   ├── knowledge.ts          # đọc content/knowledge/*.md, chấm điểm liên quan
│   │   ├── openai.ts             # wrapper gọi OpenAI SDK, khởi tạo client với baseURL từ OPENAI_API_URL
│   │   └── auth.ts               # verifyCredentials(), signSession(), verifySession()
│   └── types/
│       └── poi.ts                # type Poi, PoiCategory
└── public/
```

## Schema file Excel `data/poi.xlsx` (sheet tên `POI`)

| Cột | Kiểu | Bắt buộc | Ví dụ |
|---|---|---|---|
| `id` | string, duy nhất | có | `poi_001` |
| `name` | string | có | La Pán Tẩn |
| `category` | enum: `ruong_bac_thang`, `diem_ngam_canh`, `homestay`, `nha_hang`, `le_hoi`, `dac_san` | có | `ruong_bac_thang` |
| `commune` | string | không | La Pán Tẩn |
| `lat` | number | có | 21.7863 |
| `lng` | number | có | 104.1129 |
| `address` | string | không | |
| `description` | string | không | |
| `price_range` | string | không (dùng cho homestay/nha_hang) | 150.000-300.000đ/đêm |
| `phone` | string | không | |
| `best_season` | string | không | Thg9-Thg10 |
| `image_url` | string | không | |
| `rating` | number 1-5 | không | 4.5 |

`scripts/import-poi.ts` dùng package `xlsx` (SheetJS) để đọc sheet `POI`, validate các cột bắt buộc
(bỏ qua + log cảnh báo dòng thiếu `lat`/`lng`/`category` không hợp lệ), rồi viết ra `data/poi.json`
dạng `Poi[]`. Chạy bằng `npm run import:poi`.

## Cấu trúc file Markdown `content/knowledge/*.md`

Mỗi file có frontmatter đơn giản:

```markdown
---
title: Mùa lúa và thời điểm đẹp nhất
tags: [mua-lua, thoi-diem, le-hoi]
---

Nội dung viết tự do bằng tiếng Việt...
```

`lib/knowledge.ts` đọc toàn bộ file trong `content/knowledge/`, dùng `gray-matter` để tách frontmatter,
chấm điểm liên quan bằng cách so khớp từ khóa giữa câu hỏi người dùng và (title + tags + nội dung),
chọn ra top 3 file điểm cao nhất, nối nội dung của chúng làm ngữ cảnh cho system prompt gọi model chat.
Nếu không file nào khớp, dùng toàn bộ nội dung của `content/knowledge/tong-quan.md` (cần tạo thêm file này làm fallback).

## API contract

### `POST /api/auth/login`
Body: `{ username: string, password: string }`
Xử lý: so `username` với `ADMIN_USERNAME`, so `password` với `ADMIN_PASSWORD_HASH` bằng `bcrypt.compare`.
Đúng → ký JWT (payload chỉ gồm `{ username, iat, exp }`, hạn 7 ngày) bằng `jose`, set cookie `session` (`httpOnly`, `secure` khi production, `sameSite: "lax"`).
Sai → trả `401` với message chung **"Sai tên đăng nhập hoặc mật khẩu"** (không nói rõ sai ở username hay password, tránh dò tài khoản).
Response: `{ ok: true }` hoặc `{ ok: false, message: string }`

### `POST /api/auth/logout`
Xoá cookie `session`. Response: `{ ok: true }`

### `GET /api/poi`
Query params: `category` (optional), `commune` (optional).
Response: `{ data: Poi[] }`

### `POST /api/chat`
Body: `{ message: string, history: { role: "user" | "assistant", content: string }[] }`
Xử lý:
1. Gọi `lib/knowledge.ts` để lấy 3 đoạn kiến thức liên quan nhất tới `message`.
2. Ghép thành system prompt: vai trò "Chợ Mù" + nội dung 3 file đó + hướng dẫn không bịa số liệu ngoài phạm vi.
3. Gọi OpenAI SDK (`model: "gpt-4.1-mini"`, `temperature: 0.4`) với `messages: [{role:"system", content: systemPrompt}, ...history, {role:"user", content: message}]`.
Response: `{ reply: string, sources: string[] }` — `sources` là tên các file .md đã dùng, để FE có thể hiển thị "Nguồn: mua-lua.md" nếu muốn.

## Biến môi trường (`.env.local`)

```
OPENAI_API_KEY=...             # chỉ dùng server-side, KHÔNG prefix NEXT_PUBLIC_
OPENAI_API_URL=https://api.openai.com/v1   # base URL cho OpenAI SDK; đổi khi dùng proxy nội bộ hoặc provider tương thích OpenAI-API khác
NEXT_PUBLIC_MAPBOX_TOKEN=...    # hoặc NEXT_PUBLIC_VIETMAP_KEY nếu đổi provider
ADMIN_USERNAME=...             # ví dụ: admin
ADMIN_PASSWORD_HASH=...        # bcrypt hash, tạo bằng: node scripts/hash-password.ts "mật khẩu của bạn"
SESSION_SECRET=...             # chuỗi ngẫu nhiên tối thiểu 32 ký tự, dùng để ký JWT session
```

## Quy ước code

- TypeScript strict mode, không dùng `any` trừ khi thật cần thiết.
- Component bản đồ và chat là Client Component (`"use client"`), phần fetch POI ban đầu có thể làm Server Component.
- Không để `OPENAI_API_KEY` lộ ra bất kỳ file phía client hoặc response nào.
- Marker trên bản đồ tô màu theo `category` (dùng cùng bảng màu cho legend và popup).
- Khi số lượng POI lớn (>50 điểm trong viewport), dùng clustering (`supercluster` hoặc tính năng cluster built-in của Mapbox GL) — đây là việc làm sau MVP, không block launch đầu tiên.
- `lib/openai.ts` khởi tạo client bằng `new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_API_URL || "https://api.openai.com/v1" })` — nếu không set `OPENAI_API_URL` thì tự rơi về endpoint chính thức, không bắt buộc phải khai báo khi dùng OpenAI gốc.
- Lỗi gọi OpenAI API (rate limit, timeout, model không tồn tại) phải trả về message tiếng Việt dễ hiểu cho người dùng, không lộ stack trace.
- `middleware.ts` chặn ở edge runtime trước khi vào bất kỳ route nào (trừ `/login`, `/api/auth/login`, file tĩnh) — kiểm tra cookie `session` hợp lệ bằng `jose.jwtVerify`, hết hạn hoặc sai chữ ký thì redirect về `/login`.
- Không log ra console giá trị `password`, `ADMIN_PASSWORD_HASH`, hoặc `SESSION_SECRET` ở bất kỳ đâu.
- `.env.local` không commit vào git (đã có trong `.gitignore` mặc định của `create-next-app`) — chỉ commit `.env.local.example` với giá trị rỗng/placeholder.

## Việc cần làm (thứ tự gợi ý cho Claude Code)

1. Khởi tạo Next.js (App Router, TypeScript, Tailwind): `npx create-next-app@latest mucangchai-app --typescript --tailwind --app`
2. Cài dependencies: `react-map-gl`, `mapbox-gl`, `xlsx`, `gray-matter`, `openai`, `bcryptjs`, `jose`
3. Tạo `types/poi.ts`, `data/poi.xlsx` mẫu (5-10 dòng dữ liệu thật về Mù Cang Chải để test).
4. Viết `scripts/import-poi.ts`, thêm script `"import:poi"` vào `package.json`, chạy thử ra `data/poi.json`.
5. Viết `scripts/hash-password.ts`, chạy để tạo `ADMIN_PASSWORD_HASH`, điền vào `.env.local` cùng `ADMIN_USERNAME` và `SESSION_SECRET`.
6. Viết `lib/auth.ts` (verifyCredentials, signSession, verifySession), `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `middleware.ts`.
7. Viết `components/LoginForm.tsx` + `app/login/page.tsx`, test luồng đăng nhập/đăng xuất trước khi làm tiếp các phần khác.
8. Viết `lib/poi.ts` + `app/api/poi/route.ts`.
9. Viết 5 file mẫu trong `content/knowledge/` (nội dung tham khảo từ bản demo HTML trước đó: mùa lúa, đường đi, homestay, lễ hội, đặc sản) + `tong-quan.md` fallback.
10. Viết `lib/knowledge.ts` (keyword scoring) + `lib/openai.ts` + `app/api/chat/route.ts`.
11. Viết `components/MapView.tsx` (Mapbox GL, marker từ `/api/poi`, popup khi click).
12. Viết `components/PoiFilterBar.tsx`, `PoiDetailCard.tsx`, `SeasonToggle.tsx`.
13. Viết `components/ChatWidget.tsx` gọi `/api/chat`.
14. Ghép tất cả vào `app/page.tsx`.
15. Test end-to-end: đăng nhập, import POI thật, hỏi chatbot vài câu, kiểm tra marker/popup/filter, đăng xuất rồi thử truy cập `/` trực tiếp để chắc chắn bị chặn.

## Ngoài phạm vi MVP (không làm ở bản demo)

- Nhiều tài khoản, đăng ký, phân quyền theo vai trò (chỉ có 1 tài khoản admin, hardcode qua env).
- Quên mật khẩu / tự đổi mật khẩu qua UI (đổi mật khẩu = tạo hash mới + sửa `.env.local` + restart server).
- Đặt phòng/thanh toán trực tuyến.
- Đa ngôn ngữ (chỉ tiếng Việt ở MVP).
- UI chỉnh sửa Excel trực tiếp trên web (biên tập viên sửa file Excel rồi chạy lại `import:poi`).
- Vector search / embeddings cho knowledge base (chỉ cần khi số file .md lên tới hàng trăm).
