# LỘ TRÌNH PHÁT TRIỂN BACKEND: CÁC CHẶNG NGHIỆP VỤ

Tài liệu này định nghĩa 3 chặng phát triển cốt lõi cho Backend (.NET 8). Mỗi chặng tương ứng với một Module nghiệp vụ, tuân thủ nguyên tắc xây dựng "xuyên tâm" từ dưới lên trên (Repositories -> Services -> Controllers -> DTOs).

---

## CHẶNG 2: MODULE XÁC THỰC & CỐT LÕI (đã hoàn thành)
- **Tên nhánh (Branch):** `feature/auth`
- **Mô tả ngắn:** Xây dựng hàng rào bảo mật và luồng đăng nhập chung cho toàn bộ hệ thống. Thiết lập các hàm cơ bản để khởi tạo một đợt xét học bổng mới.
- **Tác nhân tham gia:** Tất cả 7 tác nhân (Sinh viên, Khoa, Hội đồng, CTSV, Đào tạo, KH-TC, Hiệu trưởng).
- **Nhiệm vụ (Các API cần xây dựng):**
  - Viết logic mã hóa mật khẩu và cấu hình sinh Token JWT (Roles-based).
  - API `POST /api/auth/login`: Xử lý đăng nhập, kiểm tra thông tin và trả về JWT kèm Role.
  - API `POST /api/dothocbong`: Khởi tạo một đợt học bổng mới với trạng thái mặc định là `KhoiTao`.

---

# LỘ TRÌNH PHÁT TRIỂN BACKEND: CÁC CHẶNG NGHIỆP VỤ (CORE API)

Tài liệu này định nghĩa các chặng phát triển cốt lõi cho Backend (.NET 8). Lộ trình bám sát 100% theo Điều 7 - Quy định cấp học bổng UTE 2025.

---

## CHẶNG 3: MODULE ĐẦU VÀO & XÉT DUYỆT CẤP KHOA
- **Tên nhánh (Branch):** `feature/khoa-approval`
- **Tác nhân tham gia:** Phòng Đào tạo, Phòng CTSV, Khoa.
- **Nhiệm vụ (Các API Cốt lõi):**
  - **1. Nạp dữ liệu:**
    - API `POST /api/diem/import`: Nạp dữ liệu đầu vào theo học kỳ (GPA từ Đào tạo, Điểm rèn luyện từ CTSV).
  - **2. Tự động hóa ứng viên:**
    - API `POST /api/dothocbong/{maDot}/tu-dong-quet`: Quét bảng điểm, lọc sinh viên thỏa điều kiện và tự động tạo bản ghi vào `HOSOXETHOCBONG` (Trạng thái: `ChoXet`).
  - **3. Cấp Khoa xử lý (Bước 4 - Quy định):**
    - API `GET /api/khoa/danhsach`: Khoa lấy danh sách hồ sơ.
    - API `POST /api/khoa/xephang`: Tự động xếp hạng (GPA -> ĐRL) và phân bổ ngân sách.
    - API `PUT /api/khoa/dexuat`: Khoa chốt danh sách, đổi trạng thái hồ sơ sang `KhoaDeXuat` và gửi lên Trường.

---

## CHẶNG 4: MODULE HỘI ĐỒNG THẨM ĐỊNH, KHIẾU NẠI & PHÊ DUYỆT
- **Tên nhánh (Branch):** `feature/final-decision`
- **Tác nhân tham gia:** Phòng CTSV, Hội đồng, Sinh viên, Hiệu trưởng.
- **Nhiệm vụ (Các API Cốt lõi):**
  - **1. Hội đồng họp xét chọn (Bước 5):**
    - API `GET /api/ctsv/tonghop`: CTSV tổng hợp `KhoaDeXuat` trình Hội đồng.
    - API `PUT /api/hoidong/xetchon`: Hội đồng duyệt danh sách lần 1. Đổi trạng thái các hồ sơ được chọn sang `DanhSachDuKien`.
  - **2. Công bố & Xử lý khiếu nại (Bước 6):**
    - API `GET /api/sinhvien/tracuu`: Sinh viên tra cứu xem mình có trong `DanhSachDuKien` không.
    - API `POST /api/khieunai`: Sinh viên gửi khiếu nại (Trong 10 ngày).
    - API `PUT /api/khieunai/{id}/xuly`: CTSV xử lý khiếu nại và cập nhật lại trạng thái hồ sơ nếu có sai sót.
  - **3. Hiệu trưởng phê duyệt (Bước 7):**
    - API `PUT /api/hieutruong/pheduyet`: CTSV trình Hiệu trưởng ký. Kích hoạt logic: Đổi trạng thái đợt xét thành `ChinhThuc` và copy sinh viên đạt vào bảng `DSHOCBONG`.