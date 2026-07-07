# Kế hoạch implement — Bản đồ số & Chatbot Mù Cang Chải

Nguồn quyết định kỹ thuật: [CLAUDE.md](../CLAUDE.md). Kế hoạch này chia việc theo 6 giai đoạn,
mỗi giai đoạn có checklist, file liên quan, và tiêu chí "xong". Thứ tự bám theo mục
"Việc cần làm" trong CLAUDE.md nhưng nhóm lại thành các giai đoạn có thể test độc lập.

## Giai đoạn

1. [01-scaffold.md](01-scaffold.md) — Khởi tạo project, dependencies, cấu trúc thư mục, types.
2. [02-auth.md](02-auth.md) — Đăng nhập/đăng xuất, session cookie, middleware bảo vệ route.
3. [03-poi-pipeline.md](03-poi-pipeline.md) — Excel → JSON, API `/api/poi`.
4. [04-knowledge-chat.md](04-knowledge-chat.md) — Knowledge base Markdown, keyword scoring, `/api/chat`.
5. [05-map-ui.md](05-map-ui.md) — Bản đồ Mapbox GL, filter, detail card, chat widget, ghép `app/page.tsx`.
6. [06-e2e-test.md](06-e2e-test.md) — Test end-to-end toàn luồng trước khi coi là "xong MVP".

## Nguyên tắc xuyên suốt (nhắc lại từ CLAUDE.md, không lặp lại chi tiết ở từng giai đoạn)

- TypeScript strict, tránh `any`.
- Không dùng tile/API OpenStreetMap — chỉ Mapbox GL (hoặc Vietmap GL tương thích).
- `OPENAI_API_KEY`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` chỉ ở server, không log ra console.
- `data/poi.json` là file sinh ra, không sửa tay — luôn sửa `data/poi.xlsx` rồi chạy `npm run import:poi`.
- `.env.local` không commit; chỉ commit `.env.local.example`.
- Mỗi giai đoạn nên build + chạy thử trước khi qua giai đoạn tiếp theo (không dồn hết đến cuối mới test).

## Trạng thái

- [x] Giai đoạn 1 — Scaffold
- [x] Giai đoạn 2 — Auth
- [x] Giai đoạn 3 — POI pipeline
- [x] Giai đoạn 4 — Knowledge + Chat
- [x] Giai đoạn 5 — Map UI
- [x] Giai đoạn 6 — E2E test (trừ 2 việc cần secret thật từ user: xem bản đồ Mapbox thật, và chatbot trả lời qua OpenAI thật — xem README/hướng dẫn cuối phiên)
