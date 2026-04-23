# TÀI LIỆU ĐẶC TẢ V15: ĐIỀU CHỈNH LOGIC HIỂN THỊ VÀ QUYỀN TRUY CẬP MODULE KHTC

**Gửi Gemini PM / Codex:** Tech Lead yêu cầu điều chỉnh lại logic hiển thị danh sách đợt học bổng và quyền thao tác (Nhập/Chỉ xem) của phòng Kế hoạch - Tài chính (KHTC). Hãy thực hiện chính xác các task sau:

## TASK 1: CẬP NHẬT SERVICE LỌC DANH SÁCH ĐỢT
- **File làm việc:** `FE/src/services/kinhPhiService.js`
- **Hàm cần sửa:** `getDotHocBongKHTC()`
- **Yêu cầu:** Sửa đổi logic `.filter()`. KHTC hiện tại cần nhìn thấy các đợt ở 3 trạng thái: 
  - `KhoiTao` (Để nạp dữ liệu kinh phí).
  - `DaCoDiem` (Để nạp dữ liệu kinh phí).
  - `ChinhThuc` (Để xem lại lịch sử phân bổ).
- *(Xóa bỏ logic lọc theo `DangXetDuyet` và `DuKien` cũ).*

## TASK 2: BỔ SUNG CẤU HÌNH BADGE TRẠNG THÁI
- **File làm việc:** `FE/src/pages/TaiChinh/TaiChinhKinhPhi.jsx`
- **Yêu cầu:** Cập nhật biến `BADGE` (hoặc `TRANG_THAI_BADGE`) để hiển thị đúng màu sắc cho 3 trạng thái mới:
  - `KhoiTao`: `{ label: 'Mới khởi tạo', cls: 'bg-blue-100 text-blue-700 border border-blue-200' }`
  - `DaCoDiem`: `{ label: 'Đã có điểm', cls: 'bg-teal-100 text-teal-700 border border-teal-200' }`
  - `ChinhThuc`: `{ label: 'Đã hoàn tất', cls: 'bg-slate-100 text-slate-700 border border-slate-200' }`

## TASK 3: TÍCH HỢP CHẾ ĐỘ CHỈ XEM (READ-ONLY) CHO LỊCH SỬ
- **File làm việc:** `TaiChinhKinhPhi.jsx`
- **Yêu cầu Logic:** Khai báo một biến kiểm tra trạng thái: `const isReadOnly = selectedDot?.trangThai === 'ChinhThuc';`
- **Cập nhật Giao diện (UI):**
  1. **Khóa Bảng nhập liệu:** Tại các ô `<input>` nhập tiền (`kinhPhi`, `mucHBLoaiKha`), truyền prop `disabled={isReadOnly}`. Đổi màu nền sang xám (`bg-slate-50`) và cursor thành `not-allowed` nếu đang bị khóa.
  2. **Ẩn Nút thao tác:** Nếu `isReadOnly === true`, **KHÔNG** hiển thị cụm nút "Tải file mẫu" và "Upload Excel".
  3. **Ẩn Nút Submit:** Tương tự, **KHÔNG** hiển thị nút "Chốt Ngân Sách" ở dưới cùng bảng nếu đang ở chế độ Chỉ xem.
  4. Thay vào đó, có thể hiển thị một Badge nhỏ góc trên bảng: *"🔒 Đợt học bổng đã hoàn tất (Chỉ xem)"*.