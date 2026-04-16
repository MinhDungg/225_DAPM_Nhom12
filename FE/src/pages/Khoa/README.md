# 📋 HƯỚNG DẪN SỬ DỤNG GIAO DIỆN KHOA

## 🎯 TỔNG QUAN

Giao diện **KhoaDashboard** được thiết kế để Ban Chủ nhiệm Khoa thực hiện 3 task chính:

1. **Task 2.1:** Xem danh sách hồ sơ chờ duyệt
2. **Task 2.2:** Xếp hạng và phân bổ học bổng
3. **Task 2.3:** Chốt danh sách đề xuất

---

## 🔄 LUỒNG NGHIỆP VỤ

```
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: XEM DANH SÁCH HỒ SƠ CHỜ DUYỆT                     │
│  - Hiển thị danh sách hồ sơ TrangThai = "ChoXet"           │
│  - Nhập Mã đợt và Ngân sách                                │
│  - Click "Chạy thuật toán xếp hạng"                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: XẾP HẠNG VÀ PHÂN BỔ HỌC BỔNG                      │
│  - Hiển thị kết quả xếp hạng (Hạng, GPA, ĐRL, Xếp loại)   │
│  - Hiển thị thống kê (Ngân sách, Chi tiêu, Số lượng)      │
│  - Tự động chọn sinh viên "Đủ NS"                         │
│  - Có thể bỏ chọn/chọn thêm thủ công                      │
│  - Click "Chốt danh sách"                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: HOÀN THÀNH                                         │
│  - Hiển thị thông báo thành công                           │
│  - Danh sách đã chuyển lên Hội đồng                        │
│  - Click "Quay lại trang chủ" để làm lại                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 CẤU TRÚC FILE

```
FE/src/
├── services/
│   └── khoaService.js          # API service cho 3 task
└── pages/
    └── Khoa/
        ├── KhoaDashboard.jsx   # Giao diện chính
        └── README.md           # File này
```

---

## 🔧 CẤU HÌNH

### 1. Cấu hình API URL

File: `FE/src/services/khoaService.js`

```javascript
const API_BASE_URL = 'https://localhost:7130/api';
```

Thay đổi URL nếu backend chạy ở port khác.

### 2. Cấu hình Token

Token được lấy từ `localStorage`:

```javascript
const token = localStorage.getItem('token');
```

Đảm bảo sau khi login, token được lưu vào localStorage.

---

## 🎨 GIAO DIỆN

### BƯỚC 1: Xem danh sách và nhập ngân sách

![Step 1](https://via.placeholder.com/800x400?text=Step+1)

**Chức năng:**
- Hiển thị danh sách hồ sơ chờ duyệt (Task 2.1)
- Form nhập Mã đợt và Ngân sách
- Tìm kiếm theo MSSV hoặc Họ tên
- Button "Chạy thuật toán xếp hạng"

**Dữ liệu hiển thị:**
- Mã hồ sơ
- MSSV
- Họ và Tên
- Lớp
- GPA
- ĐRL
- Trạng thái

---

### BƯỚC 2: Kết quả xếp hạng

![Step 2](https://via.placeholder.com/800x400?text=Step+2)

**Chức năng:**
- Hiển thị kết quả xếp hạng (Task 2.2)
- 4 thẻ thống kê:
  - Ngân sách
  - Đã chi tiêu
  - Số lượng được nhận
  - Tổng hồ sơ
- Bảng xếp hạng chi tiết
- Checkbox chọn sinh viên để chốt
- Button "Chốt danh sách"

**Dữ liệu hiển thị:**
- Thứ hạng
- MSSV
- Họ và Tên
- Lớp
- GPA / ĐRL
- Xếp loại (Xuất sắc/Giỏi/Khá)
- Mức học bổng
- Trạng thái (Đủ NS / Hết NS)
- Checkbox chọn

**Màu sắc xếp loại:**
- Xuất sắc: Tím (purple)
- Giỏi: Xanh dương (blue)
- Khá: Xanh lá (green)

---

### BƯỚC 3: Hoàn thành

![Step 3](https://via.placeholder.com/800x400?text=Step+3)

**Chức năng:**
- Hiển thị thông báo thành công
- Button "Quay lại trang chủ"

---

## 🔌 API INTEGRATION

### Task 2.1: Lấy danh sách chờ duyệt

```javascript
const response = await khoaService.layDanhSachChoDuyet();
```

**Response:**
```json
{
  "success": true,
  "message": "Lay danh sach thanh cong",
  "data": [
    {
      "maHoSo": 1,
      "maSV": "23115053122101",
      "hoTenSinhVien": "Nguyễn Sinh Viên 01",
      "tenLop": "23T1",
      "gpa": 3.5,
      "diemRenLuyen": 85,
      "diemNCKH": 5,
      "diemHDCD": 3,
      "ngayNop": "2024-01-15T10:30:00",
      "trangThai": "ChoXet"
    }
  ]
}
```

---

### Task 2.2: Xếp hạng và phân bổ

```javascript
const response = await khoaService.xepHangVaPhanBo(maDot, nganSach);
```

**Request:**
```json
{
  "maDot": 1,
  "nganSach": 50000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Xep hang va phan bo thanh cong",
  "data": {
    "tongNganSach": 50000000,
    "tongChiTieu": 41250000,
    "soLuongDuocNhan": 4,
    "tongSoHoSo": 5,
    "danhSachXepHang": [
      {
        "thuHang": 1,
        "maHoSo": 5,
        "maSV": "23115053122105",
        "hoTen": "Hoàng Sinh Viên 05",
        "tenLop": "23T1",
        "gpa": 3.9,
        "diemRenLuyen": 92,
        "xepLoai": "XuatSac",
        "mucHocBong": 11550000,
        "duocNhan": true
      }
    ]
  }
}
```

---

### Task 2.3: Chốt danh sách

```javascript
const response = await khoaService.chotDanhSachDeXuat(maDot, danhSachMaHoSo);
```

**Request:**
```json
{
  "maDot": 1,
  "danhSachMaHoSo": [5, 2, 4, 1]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chot danh sach de xuat thanh cong",
  "data": {
    "soLuongDaChot": 4,
    "danhSachMaHoSo": [5, 2, 4, 1]
  }
}
```

---

## 🎯 TÍNH NĂNG CHI TIẾT

### 1. Tìm kiếm

```javascript
const filteredList = hoSoChoDuyet.filter(hs =>
    hs.hoTenSinhVien.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hs.maSV.includes(searchTerm)
);
```

Tìm kiếm theo:
- Họ tên sinh viên (không phân biệt hoa thường)
- MSSV

---

### 2. Chọn/Bỏ chọn sinh viên

```javascript
const toggleChon = (maHoSo) => {
    setDanhSachChon(prev => 
        prev.includes(maHoSo) 
            ? prev.filter(id => id !== maHoSo)
            : [...prev, maHoSo]
    );
};
```

- Tự động chọn sinh viên có `duocNhan = true`
- Có thể bỏ chọn hoặc chọn thêm thủ công

---

### 3. Xử lý lỗi

```javascript
try {
    const response = await khoaService.layDanhSachChoDuyet();
    if (response.success) {
        setHoSoChoDuyet(response.data);
    }
} catch (err) {
    setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
}
```

Hiển thị thông báo lỗi màu đỏ ở đầu trang.

---

### 4. Loading state

```javascript
{loading ? (
    <div className="p-12 text-center">
        <Loader className="animate-spin mx-auto text-blue-600" size={40} />
        <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
    </div>
) : (
    // Render table
)}
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 401 Unauthorized

**Nguyên nhân:** Token hết hạn hoặc không hợp lệ

**Giải pháp:**
1. Kiểm tra token trong localStorage
2. Login lại để lấy token mới

---

### Lỗi CORS

**Nguyên nhân:** Backend chưa cấu hình CORS

**Giải pháp:** Đảm bảo backend có:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

---

### Lỗi SSL Certificate

**Nguyên nhân:** HTTPS localhost không tin cậy

**Giải pháp:**
1. Sử dụng HTTP: `http://localhost:5163`
2. Hoặc tin cậy certificate trong trình duyệt

---

## 📝 CHECKLIST TRƯỚC KHI CHẠY

- [ ] Backend đang chạy tại `https://localhost:7130`
- [ ] Đã login và có token trong localStorage
- [ ] Database có dữ liệu mẫu (hồ sơ ChoXet)
- [ ] CORS đã được cấu hình
- [ ] Tài khoản Khoa: `khoacntt` / `123456`

---

## 🚀 HƯỚNG DẪN CHẠY

1. **Khởi động Backend:**
```bash
cd BE
dotnet run
```

2. **Khởi động Frontend:**
```bash
cd FE
npm install
npm run dev
```

3. **Login:**
- Truy cập: `http://localhost:5173/login`
- Tài khoản: `khoacntt`
- Mật khẩu: `123456`

4. **Truy cập Dashboard:**
- URL: `http://localhost:5173/khoa/dashboard`

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Console trình duyệt (F12)
2. Network tab để xem API response
3. Backend logs

---

**Chúc bạn thành công! 🎉**
