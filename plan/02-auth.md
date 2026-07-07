# Giai đoạn 2 — Đăng nhập, session, middleware

## Mục tiêu
Một tài khoản admin (từ `.env.local`) đăng nhập được, session cookie JWT hoạt động,
mọi route (trừ `/login`, `/api/auth/login`, file tĩnh) bị chặn khi chưa đăng nhập.

## Việc làm

1. `scripts/hash-password.ts`:
   - Nhận argv, `bcrypt.hash(password, 10)`, in ra hash. Không log lại chính password.
   - Chạy: `node scripts/hash-password.ts "mật khẩu demo"` → dán kết quả vào `ADMIN_PASSWORD_HASH`
     trong `.env.local` (tạo file này từ `.env.local.example` nếu chưa có), cùng `ADMIN_USERNAME=admin`
     và `SESSION_SECRET` (chuỗi random ≥32 ký tự, có thể sinh bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).

2. `src/lib/auth.ts`:
   - `verifyCredentials(username, password): Promise<boolean>` — so `username` với `process.env.ADMIN_USERNAME`,
     `bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)`.
   - `signSession(username): Promise<string>` — dùng `jose.SignJWT({ username }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secretKey)`.
   - `verifySession(token): Promise<{ username: string } | null>` — `jose.jwtVerify`, bắt lỗi trả `null` (không throw ra ngoài).
   - `secretKey` lấy từ `new TextEncoder().encode(process.env.SESSION_SECRET)`, tính một lần ở module scope.

3. `src/app/api/auth/login/route.ts` (POST):
   - Parse body `{ username, password }`.
   - `verifyCredentials` sai → `NextResponse.json({ ok: false, message: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 })`.
   - Đúng → `signSession`, set cookie `session` (`httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `maxAge: 7*24*3600`, `path: "/"`).
   - Trả `{ ok: true }`.

4. `src/app/api/auth/logout/route.ts` (POST): xoá cookie `session` (set maxAge 0 hoặc dùng `cookies().delete`), trả `{ ok: true }`.

5. `middleware.ts` (root, cạnh `next.config.js`):
   - `matcher` loại trừ `/login`, `/api/auth/login`, `_next/static`, `_next/image`, `favicon.ico`.
   - Đọc cookie `session`, `jose.jwtVerify` với secret — thất bại hoặc thiếu → `NextResponse.redirect(new URL("/login", req.url))`.
   - Chạy edge runtime, không import `bcryptjs` ở đây (bcryptjs không chạy tốt trên edge) — middleware chỉ verify JWT bằng `jose`, không cần bcrypt.

6. `src/components/LoginForm.tsx` (`"use client"`):
   - Form username/password, submit `fetch("/api/auth/login", { method: "POST", body: JSON.stringify(...) })`.
   - Thành công → `router.push("/")` (hoặc `router.refresh()` rồi push).
   - Lỗi → hiển thị `message` trả về từ API.

7. `src/app/login/page.tsx`: render `LoginForm`, layout tối giản (không cần sidebar/map).

## Tiêu chí xong
- Truy cập `/` khi chưa đăng nhập → redirect `/login`.
- Đăng nhập đúng → vào `/` được, cookie `session` xuất hiện (httpOnly).
- Đăng nhập sai → thấy message "Sai tên đăng nhập hoặc mật khẩu", không lộ sai ở đâu.
- Gọi `/api/auth/logout` → cookie mất, truy cập `/` lại bị redirect.
- Không có `console.log` in ra password/hash/secret ở bất kỳ file nào (grep lại trước khi qua giai đoạn sau).
