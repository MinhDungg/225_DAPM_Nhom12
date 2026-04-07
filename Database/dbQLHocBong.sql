-- =======================================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ HỌC BỎNG UTE
-- =======================================================

-- 1. KIỂM TRA VÀ TẠO DATABASE MỚI
IF EXISTS (SELECT * FROM sys.databases WHERE name = N'dbQLHocBong')
BEGIN
    -- Đóng tất cả các kết nối đến cơ sở dữ liệu
    EXECUTE sp_MSforeachdb 'IF ''?'' = ''dbQLHocBong'' 
    BEGIN 
        DECLARE @sql AS NVARCHAR(MAX) = ''USE [?]; ALTER DATABASE [?] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;''
        EXEC (@sql)
    END'
    -- Xóa tất cả các kết nối tới cơ sở dữ liệu (thực hiện qua hệ thống master)
    USE master;
    DROP DATABASE dbQLHocBong;
END
GO

-- Tạo mới database
CREATE DATABASE dbQLHocBong;
GO

-- Chuyển sang sử dụng database vừa tạo
USE dbQLHocBong;
GO


-- 2. TẠO CÁC BẢNG (TABLES)

-- Bảng Tài khoản (Dùng chung cho Sinh viên và Cán bộ/Giảng viên)
CREATE TABLE [TAIKHOAN] (
  [MaTK] int PRIMARY KEY IDENTITY(1,1),
  [TenDangNhap] varchar(100) NOT NULL UNIQUE,
  [MatKhau] varchar(255) NOT NULL,
  [VaiTro] varchar(50) NOT NULL, -- Admin, SinhVien, Khoa, CTSV, KHTC, HoiDong, HieuTruong
  [TrangThai] bit DEFAULT 1 -- 1 (Hoạt động), 0 (Đã khóa)
);
GO

-- Bảng Phòng ban
CREATE TABLE [PHONGBAN] (
  [MaPhong] int PRIMARY KEY IDENTITY(1,1),
  [TenPhong] nvarchar(150) NOT NULL
);
GO

-- Bảng Cán bộ (Quản lý nhân sự các phòng ban, khoa, ban giám hiệu)
CREATE TABLE [CANBO] (
  [MaCB] int PRIMARY KEY IDENTITY(1,1),
  [HoTen] nvarchar(150) NOT NULL,
  [Email] varchar(100) NOT NULL,
  [ChucVu] nvarchar(100),
  [MaPhong] int,
  [MaTK] int UNIQUE
);
GO

-- Bảng Khoa
CREATE TABLE [KHOA] (
  [MaKhoa] int PRIMARY KEY IDENTITY(1,1),
  [TenKhoa] nvarchar(150) NOT NULL
);
GO

-- Bảng Lớp
CREATE TABLE [LOP] (
  [MaLop] int PRIMARY KEY IDENTITY(1,1),
  [TenLop] nvarchar(100) NOT NULL,
  [MaKhoa] int NOT NULL
);
GO

-- Bảng Sinh viên
CREATE TABLE [SINHVIEN] (
  [MaSV] varchar(20) PRIMARY KEY, -- Sử dụng mã SV thực tế (VD: 23115053122108)
  [HoTen] nvarchar(150) NOT NULL,
  [NgaySinh] date,
  [Email] varchar(100) NOT NULL,
  [SDT] varchar(15),
  [MaLop] int NOT NULL,
  [MaTK] int UNIQUE
);
GO

-- Bảng Kết quả học tập (Lưu GPA từng kỳ)
CREATE TABLE [KETQUAHOCTAP] (
  [MaDiem] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL,
  [NamHoc] varchar(20) NOT NULL,
  [GPA] float NOT NULL,
  [SoTC] int NOT NULL,
  [MaCB_Nhap] int -- Cán bộ phòng Đào tạo import
);
GO

-- Bảng Điểm rèn luyện
CREATE TABLE [DIEMRENLUYEN] (
  [MaDRL] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL,
  [NamHoc] varchar(20) NOT NULL,
  [DiemSo] int NOT NULL,
  [MaCB_Nhap] int -- Cán bộ phòng CTSV import
);
GO

-- Bảng Đợt học bổng
CREATE TABLE [DOTHOCBONG] (
  [MaDot] int PRIMARY KEY IDENTITY(1,1),
  [LoaiDot] nvarchar(150) NOT NULL, -- VD: Khuyến khích học tập, Thử thách UTE
  [HocKy] int NOT NULL,
  [NamHoc] varchar(20) NOT NULL,
  [TrangThai] varchar(50) DEFAULT 'KhoiTao' -- KhoiTao, DangXetDuyet, DuKien, ChinhThuc
);
GO

-- Bảng Hồ sơ xét học bổng
CREATE TABLE [HOSOXETHOCBONG] (
  [MaHoSo] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [MaDot] int NOT NULL,
  [NgayNop] datetime DEFAULT GETDATE(),
  [GPA] float NOT NULL,
  [DiemNCKH] float DEFAULT 0,
  [DiemHDCD] float DEFAULT 0,
  [XepLoaiHB] nvarchar(50),
  [TrangThai] varchar(50) DEFAULT 'ChoXet', -- ChoXet, KhoaDeXuat, HoiDongDuyet, TuChoi
  [MaCB_Duyet] int
);
GO

-- Bảng Khiếu nại
CREATE TABLE [KHIEUNAI] (
  [MaKhieuNai] int PRIMARY KEY IDENTITY(1,1),
  [MaHoSo] int NOT NULL,
  [NoiDung] nvarchar(MAX) NOT NULL,
  [MinhChung] varchar(255),
  [NgayGui] datetime DEFAULT GETDATE(),
  [TrangThai] varchar(50) DEFAULT 'ChoXuLy', -- ChoXuLy, DaXuLy
  [MaCB_Duyet] int
);
GO

-- Bảng Danh sách Học bổng (Lưu vết Quyết định của Hiệu trưởng)
CREATE TABLE [DSHOCBONG] (
  [MaDS] int PRIMARY KEY IDENTITY(1,1),
  [MaDot] int NOT NULL,
  [MaSV] varchar(20) NOT NULL,
  [XepLoai] nvarchar(50),
  [SoTien] decimal(18,2) NOT NULL,
  [NgayPheDuyet] datetime DEFAULT GETDATE(),
  [MaCB_PheDuyet] int NOT NULL
);
GO

-- Bảng Chi trả (Giải ngân tiền từ KHTC)
CREATE TABLE [CHITRA] (
  [MaChiTra] int PRIMARY KEY IDENTITY(1,1),
  [MaHoSo] int NOT NULL,
  [SoTien] decimal(18,2) NOT NULL,
  [NgayXacNhan] datetime,
  [TrangThai] varchar(50) DEFAULT 'ChuaGiaiNgan', -- ChuaGiaiNgan, DaGiaiNgan
  [MaCB_GiaiNgan] int
);
GO


-- 3. TẠO KHÓA NGOẠI (FOREIGN KEYS)

-- Khóa ngoại bảng Cán bộ
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaPhong]) REFERENCES [PHONGBAN] ([MaPhong]);
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaTK]) REFERENCES [TAIKHOAN] ([MaTK]);

-- Khóa ngoại bảng Lớp
ALTER TABLE [LOP] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]);

-- Khóa ngoại bảng Sinh viên
ALTER TABLE [SINHVIEN] ADD FOREIGN KEY ([MaLop]) REFERENCES [LOP] ([MaLop]);
ALTER TABLE [SINHVIEN] ADD FOREIGN KEY ([MaTK]) REFERENCES [TAIKHOAN] ([MaTK]);

-- Khóa ngoại bảng Kết quả học tập
ALTER TABLE [KETQUAHOCTAP] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]);
ALTER TABLE [KETQUAHOCTAP] ADD FOREIGN KEY ([MaCB_Nhap]) REFERENCES [CANBO] ([MaCB]);

-- Khóa ngoại bảng Điểm rèn luyện
ALTER TABLE [DIEMRENLUYEN] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]);
ALTER TABLE [DIEMRENLUYEN] ADD FOREIGN KEY ([MaCB_Nhap]) REFERENCES [CANBO] ([MaCB]);

-- Khóa ngoại bảng Hồ sơ xét học bổng
ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]);
ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]);
ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaCB_Duyet]) REFERENCES [CANBO] ([MaCB]);

-- Khóa ngoại bảng Khiếu nại
ALTER TABLE [KHIEUNAI] ADD FOREIGN KEY ([MaHoSo]) REFERENCES [HOSOXETHOCBONG] ([MaHoSo]);
ALTER TABLE [KHIEUNAI] ADD FOREIGN KEY ([MaCB_Duyet]) REFERENCES [CANBO] ([MaCB]);

-- Khóa ngoại bảng Danh sách học bổng
ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]);
ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]);
ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaCB_PheDuyet]) REFERENCES [CANBO] ([MaCB]);

-- Khóa ngoại bảng Chi trả
ALTER TABLE [CHITRA] ADD FOREIGN KEY ([MaHoSo]) REFERENCES [HOSOXETHOCBONG] ([MaHoSo]);
ALTER TABLE [CHITRA] ADD FOREIGN KEY ([MaCB_GiaiNgan]) REFERENCES [CANBO] ([MaCB]);
GO