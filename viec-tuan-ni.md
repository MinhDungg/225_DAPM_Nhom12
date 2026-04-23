# TÀI LIỆU ĐẶC TẢ V9: NÂNG CẤP FULLSTACK CTSV - CRUD ĐỢT HỌC BỔNG & DANH SÁCH ỨNG VIÊN

**Gửi Gemini PM / Codex:** Tech Lead yêu cầu nâng cấp toàn diện luồng quản lý Đợt học bổng (bao gồm cả Backend và Frontend) với trạng thái mới `DaCoDiem`. Database đã được cập nhật chốt bảo vệ (constraint). Hãy thực hiện tuần tự các task sau:

## 1. [BACKEND] TASK 1: CẬP NHẬT `DiemService.cs` (TRIGGER TRẠNG THÁI)
- **File làm việc:** `BE/Services/Implementations/DiemService.cs`
- **Hàm cần sửa:** `ImportDuLieuHocVuAsync`
- **Logic bổ sung:** Ngay sau khi `_context.SaveChangesAsync()` thành công cho mảng điểm sinh viên, thực hiện lấy `HocKy` và `NamHoc` từ phần tử đầu tiên của `requests`.
- Dùng LINQ truy vấn bảng `DOTHOCBONG` để tìm đợt xét đang có `HocKy` và `NamHoc` tương ứng, VÀ đang ở trạng thái `"KhoiTao"`.
- Nếu tìm thấy (`!= null`), cập nhật thuộc tính `TrangThai = "DaCoDiem"` và gọi `await _context.SaveChangesAsync()` lần nữa.

## 2. [BACKEND] TASK 2: CẬP NHẬT `DotHocBongService.cs` & CONTROLLER (API MỚI)
- **File làm việc:** `DotHocBongService.cs`, `IDotHocBongService.cs` và `DotHocBongController.cs`
- **Sửa hàm Quét ứng viên:** Trong `AutoScanCandidatesAsync`, bổ sung chốt chặn ngay đầu hàm: 
  `if (dot.TrangThai != "DaCoDiem") throw new Exception("Đợt này chưa có điểm từ phòng Đào tạo!");`
- **Thêm API Xóa (DELETE):** `DELETE /api/dothocbong/{id}`. Kiểm tra logic: Chỉ cho phép xóa khi đợt ở trạng thái `"KhoiTao"` hoặc `"DaCoDiem"`.
- **Thêm API Sửa (PUT):** `PUT /api/dothocbong/{id}` để cập nhật `HocKy`, `NamHoc`, `LoaiDot`.
- **Thêm API Xem Danh sách ứng viên (GET):** `GET /api/dothocbong/{id}/danh-sach-ung-vien`. 
  - *Logic:* Truy vấn bảng `HOSOXETHOCBONG` theo `MaDot`. Bắt buộc dùng `.Include()` hoặc `JOIN` với bảng `SINHVIEN` để lấy thuộc tính `HoTen`.
  - *DTO Trả về:* `MaSV`, `HoTen`, `GPA`, `DiemHocTap`, `DiemRenLuyen`, `GhiChu`, `TrangThai`.

## 3. [FRONTEND] TASK 3: LOGIC NÚT "QUÉT ỨNG VIÊN" VÀ TRẠNG THÁI MỚI
- **File làm việc:** `TaoDotHocBong.jsx`
- Bổ sung cấu hình Badge cho trạng thái `DaCoDiem` (Gợi ý màu: Xanh ngọc/Teal, Text: "Đã có điểm học vụ").
- **Logic hiển thị nút Quét:** Đổi điều kiện hiển thị nút "Quét ứng viên" thành: `dot.trangThai === 'DaCoDiem'`. (Nếu là `KhoiTao` thì ẩn đi, chờ Đào tạo nạp điểm).

## 4. [FRONTEND] TASK 4: TÍCH HỢP NÚT SỬA / XÓA ĐỢT HỌC BỔNG
- Tại mỗi dòng Card hiển thị Đợt học bổng, thêm Icon Sửa (Edit) và Xóa (Trash).
- **Logic Xóa:** - Chỉ render nút Xóa khi đợt ở trạng thái `KhoiTao` hoặc `DaCoDiem`. 
  - Bấm vào mở Confirm Modal. Gọi API `DELETE`, xong fetch lại danh sách.
- **Logic Sửa:** - Bấm vào sẽ map (fill) dữ liệu của đợt đó ngược lại vào State của Form ở Sidebar bên trái. 
  - Đổi Text nút submit từ "Tạo mới" thành "Cập nhật". Gọi API `PUT`, xong fetch lại danh sách và clear Form.

## 5. [FRONTEND] TASK 5: TÍNH NĂNG MASTER-DETAIL VIEW (DANH SÁCH ỨNG VIÊN)
- **Hành vi (UX):** Khi click vào một Card Đợt học bổng (không phải click vào nút Hành động), mở một Modal Fullscreen hoặc trang mới hiển thị chi tiết ứng viên.
- **Giao diện Bảng chi tiết:**
  - Tiêu đề: `Danh sách ứng viên - [Tên Đợt Học Bổng]`
  - Bảng dữ liệu (Table) với các cột lấy từ API GET ở Task 2.
- **Tính năng Lọc Trạng thái (Local Filter):**
  - Tại Header của cột `Trạng Thái`, thêm một Dropdown Select nhỏ.
  - Options: "Tất cả", "ChoXet" (Chờ xét), "Loai" (Loại).
  - Dùng logic Frontend (`Array.filter`) để lọc mảng data đang hiển thị theo Option được chọn.