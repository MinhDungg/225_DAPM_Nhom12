# TÀI LIỆU ĐẶC TẢ V13: MODULE KHTC - QUẢN LÝ NGÂN SÁCH & TÍCH HỢP SMART EXCEL

**Gửi Gemini PM / Codex:** Tech Lead yêu cầu xây dựng toàn diện giao diện Dashboard cho Phòng Kế hoạch - Tài chính (KHTC). Giao diện này sử dụng cấu trúc "Inline Drill-down" (ẩn danh sách, hiện chi tiết trên cùng 1 trang) và kết hợp song song 2 phương pháp nhập liệu: Nhập thủ công trên bảng và Import bằng file Excel.

## TASK 1: LAYOUT & DANH SÁCH ĐỢT XÉT
- **File làm việc:** `FE/src/pages/TaiChinh/TaiChinhKinhPhi.jsx` (tạo mới) (Route: `/tai-chinh/kinh-phi`).
- **Trạng thái mặc định:** Hiển thị danh sách đợt học bổng dạng List/Card.
- **Lọc Dữ liệu:** Chỉ fetch và hiển thị các đợt đang ở trạng thái **`DangXetDuyet`** (Cần cấp tiền) hoặc **`DaKetThuc`** (Để xem lại).
- **Hành vi (Drill-down):** Khi click vào một Đợt, sử dụng Framer Motion trượt sang Màn hình Phân bổ Kinh phí (Task 3), đồng thời có nút "Quay lại" để trở về danh sách.

## TASK 2: LUỒNG XỬ LÝ SMART EXCEL (TEMPLATE & IMPORT)
- **Cấu trúc file Excel quy ước:**
  - Ô `A1`: "HocKy" | Ô `B1`: [Giá trị Học kỳ]
  - Ô `A2`: "NamHoc" | Ô `B2`: [Giá trị Năm học]
  - Dòng 3: Bỏ trống.
  - Dòng 4 (Header): `MaKhoa`, `TenKhoa`, `KinhPhi`, `MucHBLoaiKha`.
- **Nút "Tải file mẫu":**
  - Khi bấm, tự động lấy `HocKy` và `NamHoc` của đợt đang chọn điền vào B1, B2.
  - Gọi API `GET /api/khoa` lấy danh sách Khoa, điền sẵn vào các cột `MaKhoa`, `TenKhoa` từ dòng 5 trở đi. Để trống 2 cột tiền.
- **Vùng Upload Excel:**
  - Hỗ trợ chọn file. Khi chọn xong, đọc ô `B1`, `B2`.
  - **Validate:** Nếu `HocKy` / `NamHoc` trong file KHÔNG KHỚP với đợt đang mở -> Báo lỗi Toast, hủy thao tác.
  - Nếu hợp lệ: Parse dữ liệu từ dòng 4 trở đi, và nạp (fill) vào Bảng nhập liệu ở Task 3.

## TASK 3: BẢNG NHẬP LIỆU ĐA NĂNG (EDITABLE SPREADSHEET)
- **Nguồn dữ liệu:** Bảng này sẽ hiển thị dữ liệu gốc (lấy từ API danh sách Khoa với số tiền = 0) HOẶC hiển thị dữ liệu sau khi Import từ Excel.
- **Giao diện Bảng:**
  - Các cột: `STT`, `Tên Khoa`, `Tổng kinh phí (VNĐ)`, `Mức HB Loại Khá (VNĐ)`.
  - **Trải nghiệm UX:** Cột `Tổng kinh phí` và `Mức HB Loại Khá` sử dụng `<input>` có thể gõ trực tiếp. Khi người dùng gõ, tự động format hiển thị dấu phẩy hàng nghìn (VD: `100,000,000`) nhưng State lưu trữ vẫn phải là số nguyên (Integer).
- **Auto-sum Footer:**
  - Tại dòng cuối cùng của bảng, thêm một hàng "TỔNG CỘNG".
  - Dùng hàm `reduce` tính tổng tự động (Real-time) cột `Tổng kinh phí` mỗi khi người dùng thay đổi dữ liệu ở bất kỳ ô input nào.

## TASK 4: LƯU DỮ LIỆU & GỌI API
- **Nút "Chốt Ngân Sách":** Nằm ở góc dưới cùng bên phải.
- **Logic khi Click:**
  1. Hiển thị Modal Xác nhận: *"Hệ thống sẽ lưu rổ ngân sách này và gửi xuống cho các Khoa để bắt đầu xếp hạng. Bạn xác nhận thao tác này?"*
  2. Map dữ liệu từ Bảng thành mảng `chiTietPhanBo` chuẩn DTO:
     `{ maKhoa: number, kinhPhi: number, mucHBLoaiKha: number }`
  3. Gọi API `POST /api/khtc/thiet-lap-kinh-phi` (Cần bổ sung vào `kinhPhiService.js`).
  4. Nếu thành công: Bắn Toast xanh, có thể vô hiệu hóa (disable) bảng để tránh sửa đổi hoặc cho phép chuyển thẳng về màn hình Danh sách đợt.