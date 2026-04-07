# LỘ TRÌNH PHÁT TRIỂN BACKEND: CÁC CHẶNG NGHIỆP VỤ

Tài liệu này định nghĩa 3 chặng phát triển cốt lõi cho Backend (.NET 8). Mỗi chặng tương ứng với một Module nghiệp vụ, tuân thủ nguyên tắc xây dựng "xuyên tâm" từ dưới lên trên (Repositories -> Services -> Controllers -> DTOs).

---

## CHẶNG 2: MODULE XÁC THỰC & CỐT LÕI
- **Tên nhánh (Branch):** `feature/auth`
- **Mô tả ngắn:** Xây dựng hàng rào bảo mật và luồng đăng nhập chung cho toàn bộ hệ thống. Thiết lập các hàm cơ bản để khởi tạo một đợt xét học bổng mới.
- **Tác nhân tham gia:** Tất cả 7 tác nhân (Sinh viên, Khoa, Hội đồng, CTSV, Đào tạo, KH-TC, Hiệu trưởng).
- **Nhiệm vụ (Các API cần xây dựng):**
  - Viết logic mã hóa mật khẩu và cấu hình sinh Token JWT (Roles-based).
  - API `POST /api/auth/login`: Xử lý đăng nhập, kiểm tra thông tin và trả về JWT kèm Role.
  - API `POST /api/dothocbong`: Khởi tạo một đợt học bổng mới với trạng thái mặc định là `KhoiTao`.

---

## CHẶNG 3: MODULE NỘP HỒ SƠ & XÉT DUYỆT CẤP KHOA
- **Tên nhánh (Branch):** `feature/khoa-approval`
- **Mô tả ngắn:** Xử lý luồng dữ liệu đầu vào, quy trình nộp đơn của sinh viên và việc xét duyệt tại cấp cơ sở (Khoa). Có tích hợp tự động hóa xếp hạng.
- **Tác nhân tham gia:** Phòng Đào tạo, Sinh Viên, Khoa, Phòng KH-TC.
- **Nhiệm vụ (Các API cần xây dựng):**
  - API `POST /api/diem`: Nạp dữ liệu đầu vào (GPA từ Đào tạo, Điểm rèn luyện từ CTSV).
  - API `POST /api/hoso`: Sinh viên nộp đơn đăng ký xét học bổng (Trạng thái hồ sơ: `ChoXet`).
  - API `GET /api/khoa/danhsach`: Lọc và xuất danh sách hồ sơ nộp vào thuộc quản lý của Khoa.
  - API `POST /api/khoa/xephang`: Logic nghiệp vụ lõi: Tự động xếp hạng sinh viên (Ưu tiên Điểm học tập -> Điểm rèn luyện) đối chiếu với mức ngân sách được cấp.
  - API `PUT /api/khoa/dexuat`: Khoa chốt danh sách nội bộ và đẩy đề xuất lên cấp Trường.

---

## CHẶNG 4: MODULE THẨM ĐỊNH TOÀN TRƯỜNG & RA QUYẾT ĐỊNH
- **Tên nhánh (Branch):** `feature/final-decision`
- **Mô tả ngắn:** Giai đoạn chốt sổ. Xử lý tổng hợp toàn trường, công khai danh sách dự kiến, giải quyết khiếu nại sinh viên và chốt danh sách chính thức.
- **Tác nhân tham gia:** Phòng CTSV, Sinh viên, Hội đồng, Hiệu trưởng.
- **Nhiệm vụ (Các API cần xây dựng):**
  - API `GET /api/ctsv/tonghop`: CTSV tổng hợp đề xuất từ tất cả các Khoa, chuyển thành "Danh sách dự kiến" và public.
  - API `POST /api/khieunai`: Sinh viên nộp khiếu nại (Giới hạn trong 10 ngày).
  - API `PUT /api/khieunai/{id}/xuly`: CTSV tiếp nhận, xem xét minh chứng và xử lý khiếu nại.
  - API `GET /api/hoidong/thamdinh`: Hội đồng xem xét và thẩm định danh sách lần cuối.
  - API `PUT /api/hieutruong/pheduyet`: Hiệu trưởng ký quyết định. (Kích hoạt logic: Đổi trạng thái đợt xét thành `CHINH_THUC` và snapshot dữ liệu sang bảng `DSHocBong`).