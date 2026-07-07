# Giai đoạn 6 — Test end-to-end (trước khi coi là xong MVP)

Bám theo bước 15 trong CLAUDE.md, cụ thể hoá thành checklist thực hiện tay (không có test tự động
ở MVP theo phạm vi CLAUDE.md — nếu muốn thêm sau, ghi vào backlog riêng, không tự thêm framework
test ngoài phạm vi đã chốt).

## Checklist

- [ ] `npm run build` không lỗi TypeScript/ESLint chặn build.
- [ ] Truy cập `/` khi chưa có cookie `session` → redirect `/login`. Thử cả truy cập trực tiếp
      `/api/poi` và `/api/chat` khi chưa đăng nhập — xác nhận middleware chặn đúng theo `matcher`
      (nếu API routes không nằm trong exclude list thì cũng phải bị chặn/redirect hoặc 401, tuỳ cách
      middleware xử lý request API vs page — quyết định nhất quán và ghi lại trong `02-auth.md` nếu
      khác với plan ban đầu).
- [ ] Đăng nhập với sai username/password → thấy đúng message chung, không phân biệt sai ở đâu.
- [ ] Đăng nhập đúng → vào `/`, thấy bản đồ + marker load từ `data/poi.json` thật (không phải mock).
- [ ] Sửa 1 dòng `data/poi.xlsx`, chạy `npm run import:poi`, reload `/` → marker cập nhật đúng thay đổi.
- [ ] Test filter category, filter xã, toggle mùa — mỗi cái đổi ra kết quả marker đúng kỳ vọng.
- [ ] Click từng loại marker (đủ 6 category nếu data có) → `PoiDetailCard` hiện đúng, không hiện field rỗng xấu.
- [ ] Hỏi chatbot ít nhất 5 câu bao trùm 5 chủ đề (mùa lúa, đường đi, homestay, lễ hội, đặc sản) →
      xác nhận `sources` trả về khớp chủ đề, nội dung reply không bịa thông tin ngoài phạm vi các file `.md`.
- [ ] Hỏi 1 câu không liên quan gì (test fallback `tong-quan.md`) → chatbot vẫn trả lời hợp lý, không lỗi.
- [ ] Tắt tạm `OPENAI_API_KEY` (hoặc set sai) → gọi chat → thấy message lỗi tiếng Việt dễ hiểu, không có
      stack trace/JSON lỗi thô hiện ra UI hoặc console server không log giá trị nhạy cảm.
- [ ] Đăng xuất → cookie `session` mất, thử truy cập `/` trực tiếp lại → bị chặn, redirect `/login`.
- [ ] Grep toàn repo các chuỗi `console.log`/`console.error` xem có vô tình log `password`,
      `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, hay `OPENAI_API_KEY` không.
- [ ] Xác nhận `.env.local` không bị commit (git status/`.gitignore`), `.env.local.example` chỉ có key rỗng.

## Sau khi pass hết
Cập nhật trạng thái trong [00-overview.md](00-overview.md), coi MVP hoàn thành theo đúng phạm vi
đã chốt trong CLAUDE.md — không tự thêm việc ngoài phạm vi (mục "Ngoài phạm vi MVP") trừ khi user
yêu cầu rõ ràng ở lượt sau.
