# Giai đoạn 5 — Bản đồ, filter, chat widget, ghép trang chính

## Mục tiêu
Trang chính (`/`, sau khi đăng nhập) hiển thị bản đồ Mapbox thật với marker POI theo màu category,
filter theo category/xã/mùa, panel chi tiết khi click marker, và chat widget gọi được `/api/chat`.

## Việc làm

1. Định nghĩa bảng màu category một lần, dùng chung cho marker/legend/popup — đặt trong
   `src/lib/poi.ts` hoặc file riêng `src/lib/categoryColors.ts` để tránh lặp:
   ```
   ruong_bac_thang, diem_ngam_canh, homestay, nha_hang, le_hoi, dac_san → mỗi loại 1 màu cố định
   ```

2. `src/components/MapView.tsx` (`"use client"`):
   - Dùng `react-map-gl` (`Map`, `Marker`, `Popup`), style Mapbox (`mapbox://styles/mapbox/streets-v12` hoặc
     style outdoor phù hợp địa hình đồi núi), token từ `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`.
   - Nhận prop `pois: Poi[]`, render 1 `Marker` mỗi POI, màu theo category.
   - Click marker → gọi callback `onSelectPoi(poi)` lên component cha (để hiển thị `PoiDetailCard`) —
     không tự quản popup phức tạp bên trong nếu cha đã có detail card riêng; có thể vẫn giữ `Popup` nhỏ
     hiển thị tên khi hover/click cho nhanh.
   - Ghi chú rõ trong comment: nếu POI trong viewport >50, cân nhắc `supercluster` — không bắt buộc làm ở MVP.

3. `src/components/PoiFilterBar.tsx` (`"use client"`):
   - Dropdown/checkbox category (6 giá trị enum), input/select xã (`commune`, lấy danh sách xã duy nhất
     từ props `pois`).
   - Gọi callback `onFilterChange({ category, commune })` lên cha.

4. `src/components/SeasonToggle.tsx` (`"use client"`):
   - Toggle "mùa nước đổ" / "mùa lúa chín" (hoặc theo `best_season` thực tế trong data) → lọc thêm POI
     có `best_season` khớp tháng hiện tại đang chọn.

5. `src/components/PoiDetailCard.tsx`:
   - Nhận `poi: Poi | null`, render ảnh (`image_url`), tên, địa chỉ, mô tả, giá, sđt, rating — ẩn field
     nào không có dữ liệu (không hiện "undefined").

6. `src/components/ChatWidget.tsx` (`"use client"`):
   - State `messages: {role, content}[]`, input box, nút gửi.
   - Gửi `POST /api/chat` với `{ message, history: messages }`, append reply vào `messages`,
     hiển thị `sources` dạng "Nguồn: mua-lua.md" nếu `sources.length > 0`.
   - Loading state khi đang chờ response; disable input trong lúc chờ.

7. `src/app/page.tsx`:
   - Server Component fetch POI ban đầu (gọi trực tiếp `getAllPois()` từ `src/lib/poi.ts` thay vì
     fetch `/api/poi` chính nó, tránh round-trip không cần thiết trong Server Component).
   - Truyền `pois` xuống Client Component wrapper chứa `MapView` + `PoiFilterBar` + `SeasonToggle` +
     `PoiDetailCard` + `ChatWidget`, quản lý state filter/selectedPoi ở component client cha đó
     (vì `page.tsx` là Server Component, không giữ state được).
   - Thêm nút "Đăng xuất" gọi `/api/auth/logout` rồi redirect `/login`.

## Tiêu chí xong
- `/` sau đăng nhập hiển thị bản đồ pan/zoom mượt, marker đúng vị trí, đúng màu theo category.
- Click marker → `PoiDetailCard` hiện đúng thông tin POI đó.
- Đổi filter category/xã → marker trên bản đồ cập nhật tương ứng (không cần load lại trang).
- Toggle mùa → marker lọc theo `best_season` đúng như mong đợi.
- Chat widget: gửi câu hỏi, nhận trả lời + nguồn, không văng lỗi console khi API chat lỗi (hiển thị
  thông báo lỗi tiếng Việt trong khung chat thay vì crash UI).
