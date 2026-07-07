# Giai đoạn 4 — Knowledge base & Chatbot

## Mục tiêu
Chatbot trả lời dựa trên nội dung `content/knowledge/*.md`, không hardcode kiến thức trong code,
không gọi API ngoài để tra cứu (chỉ gọi OpenAI-compatible API để sinh câu trả lời).

## Việc làm

1. Viết 6 file trong `content/knowledge/` (frontmatter `title` + `tags`, nội dung tiếng Việt tự do,
   dựa trên kiến thức thật về Mù Cang Chải):
   - `mua-lua.md` — mùa nước đổ (tháng 5–6), mùa lúa chín (tháng 9–10), thời điểm đẹp nhất chụp ảnh.
   - `duong-di.md` — cách di chuyển từ Hà Nội (~280km, QL32 qua Tú Lệ hoặc qua Nghĩa Lộ), xe khách/xe máy,
     tình trạng đường vào mùa mưa.
   - `homestay-va-luu-tru.md` — các khu vực homestay phổ biến (La Pán Tẩn, Chế Cu Nha...), mức giá tham khảo,
     lưu ý đặt phòng mùa cao điểm.
   - `le-hoi-va-su-kien.md` — Tuần lễ Văn hóa Du lịch Mù Cang Chải (mùa lúa chín), chợ phiên, lễ hội của
     người Mông.
   - `dac-san.md` — đặc sản (xôi ngũ sắc, cơm lam, gà đen, rượu ngô...).
   - `tong-quan.md` — file fallback: tóm tắt ngắn gọn tất cả các mục trên, dùng khi không có file nào khớp
     điểm số truy hồi.
   - Nội dung không bịa số liệu cụ thể không chắc chắn (giá, số điện thoại...) — chỉ ghi ước lượng, khuyến
     nghị người dùng xác minh lại khi cần.

2. `src/lib/knowledge.ts`:
   - `loadKnowledgeFiles(): { slug: string; title: string; tags: string[]; content: string }[]` — đọc mọi
     `.md` trong `content/knowledge/`, parse bằng `gray-matter`.
   - `scoreRelevance(query: string, doc): number` — tokenize `query` (lowercase, bỏ dấu câu), đếm số từ khóa
     xuất hiện trong `title + tags.join(" ") + content` (có thể ưu tiên trọng số cao hơn cho match trong `tags`
     và `title` so với match trong `content`).
   - `getRelevantKnowledge(query: string): { slug: string; content: string }[]` — tính điểm mọi doc, sắp xếp
     giảm dần, lấy top 3 có điểm > 0; nếu không doc nào điểm > 0 → trả về đúng 1 phần tử là toàn bộ nội dung
     `tong-quan.md`.

3. `src/lib/openai.ts`:
   - `export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_API_URL || "https://api.openai.com/v1" })`.
   - Không export hay log `apiKey` ra đâu khác.

4. `src/app/api/chat/route.ts` (POST):
   - Parse body `{ message: string, history: {role, content}[] }`.
   - `const relevant = getRelevantKnowledge(message)`.
   - Build system prompt: vai trò "Chợ Mù" (trợ lý du lịch địa phương, thân thiện, trả lời tiếng Việt),
     nối nội dung các file liên quan, kèm hướng dẫn rõ: chỉ trả lời trong phạm vi kiến thức được cung cấp,
     không bịa số liệu/giá/số điện thoại không có trong ngữ cảnh, nếu không biết thì nói không chắc và gợi ý
     hỏi thêm nguồn khác.
   - Gọi `openai.chat.completions.create({ model: "gpt-4.1-mini", temperature: 0.4, messages: [...] })` —
     bọc trong try/catch: lỗi (rate limit/timeout/model not found) → trả `{ reply: "<message tiếng Việt chung>", sources: [] }`
     với status phù hợp (502/503), KHÔNG lộ stack trace hay message gốc của SDK.
   - Thành công → trả `{ reply: completion.choices[0].message.content, sources: relevant.map(r => r.slug) }`.

## Tiêu chí xong
- Hỏi "mùa nào đẹp nhất để đi Mù Cang Chải?" → `sources` chứa `mua-lua`, reply có nội dung liên quan.
- Hỏi câu không liên quan gì tới các file (ví dụ "giá vàng hôm nay") → vẫn trả lời được nhờ fallback
  `tong-quan.md`, không lỗi 500.
- Set `OPENAI_API_KEY` sai/rút mạng → gọi `/api/chat` trả message tiếng Việt dễ hiểu, không lộ chi tiết lỗi SDK.
- Không có đoạn code nào gọi API ngoài (search engine, wiki...) để tra cứu kiến thức — chỉ đọc file local.
