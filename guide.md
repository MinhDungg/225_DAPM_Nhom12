# HƯỚNG DẪN KHỞI TẠO VÀ CẤU TRÚC THƯ MỤC DỰ ÁN
*(Đồ án phần mềm - Nhóm 12)*

Tài liệu này hướng dẫn các thành viên trong nhóm cách dọn dẹp các file mẫu mặc định của .NET/React và nắm bắt cấu trúc thư mục chuẩn của dự án.

---

## PHẦN 1: DỌN DẸP FILE MẶC ĐỊNH (CLEANUP)

Khi khởi tạo dự án tự động, framework sẽ sinh ra một số file ví dụ không cần thiết. Các thành viên cần xóa/sửa các file này trước khi bắt đầu code.

### 1.1. Backend (.NET 8 Web API)
Xóa các file ví dụ về dự báo thời tiết (WeatherForecast):
- 🗑️ **Xóa file:** `BE/WeatherForecast.cs`
- 🗑️ **Xóa file:** `BE/Controllers/WeatherForecastController.cs`
- 🗑️ **Xóa file:** `BE/BE.http` (File test API nhanh, chúng ta sẽ dùng Postman hoặc Swagger thay thế).

### 1.2. Frontend (React 18 + Vite)
Dọn dẹp trang web đếm số (counter) mặc định của Vite:
- 🗑️ **Xóa file:** `FE/src/App.css`
- 🗑️ **Xóa file:** `FE/src/assets/react.svg`
- 🧹 **Sửa file:** `FE/src/index.css` $\rightarrow$ Xóa trắng toàn bộ nội dung bên trong (để sau này tự viết CSS hoặc cấu hình Tailwind).
- 🧹 **Sửa file:** `FE/src/App.jsx` $\rightarrow$ Xóa hết nội dung cũ và thay bằng đoạn code khung dưới đây:

```jsx
import React from 'react';

function App() {
  return (
    <div>
      <h1>Hệ thống Quản lý Học bổng UTE - Nhóm 12</h1>
    </div>
  );
}

export default App;

Dự án được chia làm 2 phần chính: **BE** (Backend - .NET 8 Web API) và **FE** (Frontend - ReactJS 18).


## PHẦN 2: CẤU TRÚC CÂY THƯ MỤC CHUẨN

225_DAPM_Nhom12/
│
├── BE/                         # BACKEND - C# ASP.NET CORE WEB API (.NET 8)
│   ├── Controllers/            # Nơi tiếp nhận Request từ FE, gọi Service và trả về JSON
│   ├── Data/                   # Cấu hình Entity Framework Core (chứa AppDbContext)
│   ├── DTOs/                   # Data Transfer Objects (Dữ liệu vận chuyển qua lại API)
│   │   ├── Request/            # Dữ liệu FE gửi lên (VD: LoginRequestDTO)
│   │   └── Response/           # Dữ liệu BE trả về (VD: SinhVienResponseDTO)
│   ├── Helpers/                # Các hàm, lớp tiện ích dùng chung (Enums, Constants...)
│   ├── Models/                 # Các Class ánh xạ 1-1 với các bảng trong Database (Entities)
│   ├── Repositories/           # Tầng giao tiếp trực tiếp với Database (Thực thi CRUD)
│   │   ├── Implementations/    # Code thực thi các truy vấn SQL/EF Core
│   │   └── Interfaces/         # Các Interface định nghĩa hàm tương tác Database
│   ├── Services/               # Tầng xử lý Logic nghiệp vụ chính của hệ thống
│   │   ├── Implementations/    # Code xử lý logic (Tính tiền, xét ưu tiên, phân bổ...)
│   │   └── Interfaces/         # Các Interface định nghĩa nghiệp vụ
│   ├── appsettings.json        # File cấu hình chứa chuỗi kết nối Database, Secret Key
│   └── Program.cs              # File khởi chạy ứng dụng, cấu hình DI và Middleware
│
├── FE/                         # FRONTEND - REACTJS (VITE, REACT 18.2.0)
│   ├── public/                 # Chứa file index.html gốc, favicon, logo trường
│   ├── src/                    # Nơi chứa toàn bộ mã nguồn của giao diện
│   │   ├── assets/             # Tài nguyên tĩnh (Hình ảnh, CSS, Fonts...)
│   │   │   └── images/         
│   │   ├── components/         # Các khối giao diện tái sử dụng (UI Components)
│   │   │   ├── common/         # Component độc lập (Button, Input, Modal, Table...)
│   │   │   └── layout/         # Component cấu trúc (Header, Footer, Sidebar, Navbar...)
│   │   ├── config/             # Các cấu hình hệ thống (VD: Cấu hình interceptor Axios)
│   │   ├── context/            # Quản lý State toàn cục (React Context: AuthContext)
│   │   ├── pages/              # Các trang hiển thị chính (Chia theo nhóm Actor)
│   │   │   ├── Admin/          # Giao diện Quản trị viên (Quản lý tài khoản, danh mục)
│   │   │   ├── Auth/           # Giao diện Đăng nhập, Quên mật khẩu
│   │   │   ├── CTSV/           # Giao diện Phòng CTSV (Phân bổ, Công bố, Xử lý khiếu nại)
│   │   │   ├── Khoa/           # Giao diện cấp Khoa (Lọc DS, Xếp hạng, Đề xuất)
│   │   │   └── SinhVien/       # Giao diện Sinh viên (Tra cứu, Gửi khiếu nại)
│   │   ├── routes/             # Cấu hình luồng điều hướng (React Router, Phân quyền)
│   │   ├── services/           # Định nghĩa các hàm gọi API sang Backend (fetch/axios)
│   │   ├── utils/              # Các hàm tiện ích dùng chung (Format tiền tệ, Format ngày)
│   │   ├── App.jsx             # Component gốc bao bọc toàn bộ ứng dụng
│   │   └── main.jsx            # Điểm neo render React vào DOM của trình duyệt
│   ├── .env                    # File cấu hình biến môi trường (Lưu API URL gốc)
│   └── package.json            # Quản lý danh sách thư viện (react-router-dom, axios...)
│
├── .gitignore                  # Khai báo chặn các file/thư mục rác không đẩy lên Git
├── guide.md                    # Hướng dẫn quy trình khởi tạo và dọn dẹp mã nguồn
└── README.md                   # File giới thiệu tổng quan đồ án trên GitHub