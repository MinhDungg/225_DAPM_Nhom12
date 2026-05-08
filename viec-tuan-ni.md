# TÀI LIỆU ĐẶC TẢ V21: ĐỒNG BỘ UX/UI VÀ TỐI ƯU HÓA LUỒNG XẾP HẠNG CHO GIAO DIỆN KHOA

**Gửi Gemini PM / Codex:** Tech Lead yêu cầu tái cấu trúc phân hệ Trưởng Khoa (`KhoaDashboard.jsx` và `KhoaService.cs`). Áp dụng Master-Detail UI (Drill-down) và tối ưu hóa luồng dữ liệu: Backend chỉ truy vấn hồ sơ hợp lệ, tự động lấy ngân sách từ KHTC và giữ nguyên logic tỷ lệ chuẩn (x1.2, x1.4).

## TASK 1: [BACKEND] LẤY KINH PHÍ TỰ ĐỘNG & TỐI ƯU TRUY VẤN HỒ SƠ
- **File:** `BE/Services/Implementations/KhoaService.cs`
- **Logic cập nhật (Hàm `XepHangVaPhanBoAsync`):**
  1. Query bảng `PhanBoKinhPhi` dựa vào `MaDot` và `MaKhoa`. Ném lỗi (`Exception`) nếu Khoa chưa được KHTC rót kinh phí.
  2. Lấy `KinhPhi` làm tổng ngân sách rải tiền và `MucHBLoaiKha` làm mức sàn (base).
  3. **Tối ưu Truy vấn:** Chỉ lấy danh sách hồ sơ từ repository với điều kiện `TrangThai == "ChoXet"` thuộc `MaKhoa` và `MaDot` tương ứng. (TUYỆT ĐỐI KHÔNG viết code kiểm tra lại `CoDiemF` hay `SoTC` vì bộ lọc thô của CTSV đã xử lý việc này).
  4. Trong hàm `PhanLoaiHocBong`, giữ nguyên các hằng số tỷ lệ cứng (`1.2m` cho Giỏi, `1.4m` cho Xuất sắc) nhân với `MucHBLoaiKha` (mức sàn) để ra số tiền thực tế.

## TASK 2: [FRONTEND] GIAO DIỆN CHỌN ĐỢT (CARD-BASED MASTER VIEW)
- **File:** `FE/src/pages/Khoa/KhoaDashboard.jsx`
- **Layout:** Trình bày danh sách các đợt học bổng đang mở (Trạng thái: `DangXetDuyet`) dưới dạng các **Thẻ (Cards)** thay vì Select Dropdown.
- **Nội dung Card:** 
  - Icon đặc trưng (VD: `BookOpen`).
  - Tên đợt (VD: `Khuyến khích học tập`).
  - Học kỳ, Năm học.
- **Tương tác:** Nhấn vào Card sẽ cập nhật State `selectedDot` và trượt sang màn hình Chi tiết (Drill-down).

## TASK 3: [FRONTEND] GIAO DIỆN XÉT DUYỆT (DETAIL DRILL-DOWN VIEW)
- **Vị trí:** Xuất hiện sau khi click chọn 1 Card đợt học bổng.
- **Header Section:**
  - Nút `< Quay lại` danh sách đợt.
  - Tiêu đề: Tên đợt (Học kỳ - Năm học).
  - **Thẻ thông tin Ngân sách:** Gọi API lấy `KinhPhi` từ Backend và hiển thị nổi bật "Tổng ngân sách Khoa được cấp" để Trưởng khoa nắm rõ giới hạn chi tiêu. 
- **Body Section:**
  - Hiển thị danh sách tất cả sinh viên đạt chuẩn của Khoa (Chờ xét).
  - Nút **"Chạy thuật toán Xếp hạng & Phân bổ"**. Khi bấm, gọi API `POST /api/khoa/xephang` (Chỉ truyền `maDot`, không truyền ngân sách).
  - Trả kết quả về, cập nhật bảng với cột "Mức HB", "Thứ Hạng", và Trạng thái "Được nhận / Hết ngân sách".
- **Footer Section:** Nút "Chốt danh sách đề xuất" để cập nhật trạng thái các hồ sơ trúng tuyển thành `KhoaDeXuat` và gửi lên Hội đồng.