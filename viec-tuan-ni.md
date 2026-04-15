# BẢNG PHÂN CÔNG NHIỆM VỤ BACKEND - CHẶNG 3 & 4 (CORE API)

**Mục tiêu Sprint:** Hoàn thiện luồng xét duyệt học bổng tự động xuyên suốt từ bước nạp điểm đầu vào cho đến quyết định phê duyệt cuối cùng của Hiệu trưởng. Các tính năng phụ trợ như Khiếu nại sẽ được đưa vào Backlog để xử lý ở Phase sau.

**Quy chuẩn bắt buộc (Toàn Team):**
1. **Kiến trúc:** Tuân thủ chặt chẽ N-Tier (`Controller` -> `Service` -> `Repository`). Controller tuyệt đối không chứa Business Logic.
2. **Response format:** Mọi API trả về bắt buộc phải bọc trong class `BaseResponse<T>`.
3. **Phân quyền:** Nhớ gắn Attribute `[Authorize(Roles="...")]` chuẩn xác cho từng API.

---

**Gói công việc: Module Xét duyệt cấp Khoa (Business Logic Core)**
**Nhánh làm việc (Branch):** `feature/khoa-approval`
*Nhiệm vụ chính: Xử lý thuật toán - Xếp hạng ưu tiên và phân bổ danh sách theo ngân sách cấp Khoa.*

* **Task 2.1: Truy xuất danh sách chờ duyệt**
  * **API:** `GET /api/khoa/danhsach`
  * **Tác nhân:** Khoa.
  * **Logic:** Lấy danh sách `HoSoXetHocBong` đang ở trạng thái `ChoXet` thuộc quyền quản lý của Khoa đang đăng nhập (nhớ join bảng để hiển thị tên, GPA, ĐRL).
* **Task 2.2: Thuật toán Xếp hạng & Phân bổ (Core)**
  * **API:** `POST /api/khoa/xephang`
  * **Tác nhân:** Khoa.
  * **Logic:** Viết thuật toán sắp xếp danh sách theo thứ tự ưu tiên: Ưu tiên điểm GPA từ cao xuống thấp; trường hợp GPA bằng nhau thì dùng Điểm Rèn luyện (ĐRL) để xếp hạng. Sau đó, áp dụng thuật toán trừ lùi để cắt danh sách dựa trên ngân sách Khoa được cấp.
* **Task 2.3: Chốt danh sách đề xuất**
  * **API:** `PUT /api/khoa/dexuat`
  * **Tác nhân:** Khoa.
  * **Logic:** Đổi trạng thái các hồ sơ đã lọt top ở Task 2.2 sang `KhoaDeXuat` và chuyển tiếp lên cấp Trường.

---

**Gói công việc: Module Hội đồng, Phê duyệt & Tra cứu (Aggregation & Finalization)**
**Nhánh làm việc (Branch):** `feature/final-decision`
*Nhiệm vụ chính: Xử lý luồng gộp dữ liệu toàn trường, chốt hạ quyết định từ Ban Giám hiệu và giao diện hiển thị cho sinh viên.*

* **Task 3.1: Tổng hợp dữ liệu toàn trường**
  * **API:** `GET /api/ctsv/tonghop`
  * **Tác nhân:** Phòng CTSV / Hội đồng.
  * **Logic:** Aggregate (gom) toàn bộ hồ sơ đang có trạng thái `KhoaDeXuat` từ tất cả các Khoa lại thành một bảng tổng sắp thống nhất.
* **Task 3.2: Hội đồng xét chọn**
  * **API:** `PUT /api/hoidong/xetchon`
  * **Tác nhân:** Hội đồng.
  * **Logic:** Cho phép xem hồ sơ sinh viên trong danh sách, điều chỉnh lại trạng thái hồ sơ (có nằm trong danh sách dự kiến hay không).Cập nhật trạng thái các hồ sơ được Hội đồng duyệt qua thành `DanhSachDuKien` để chuẩn bị công bố.
* **Task 3.3: Sinh viên tra cứu (Read-only)** (tương lai có thêm khiếu nại vô đây, ai chăm thì mần trước đi tại chưa coi khúc này)
  * **API:** `GET /api/sinhvien/tracuu`
  * **Tác nhân:** Sinh viên.
  * **Logic:** Dựa vào Token JWT, lấy `MaSV` hiện tại và trả về toàn bộ tiến trình hồ sơ của sinh viên đó (Đang ở trạng thái nào? Có lọt vào danh sách dự kiến không?).
* **Task 3.4: Hiệu trưởng phê duyệt (Final Trigger)**
  * **API:** `PUT /api/hieutruong/pheduyet`
  * **Tác nhân:** Hiệu trưởng.
  * **Logic:** Hành động chốt sổ cuối cùng. Chuyển trạng thái đợt học bổng sang `ChinhThuc`. Kích hoạt Trigger/Service copy toàn bộ sinh viên đạt vào bảng `DSHOCBONG` (Snapshot) làm căn cứ bất biến để giải ngân.