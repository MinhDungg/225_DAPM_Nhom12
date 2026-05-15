-- =======================================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ HỌC BỎNG UTE
-- (Đã fix toàn bộ lỗi khóa ngoại và tên cột)
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

USE dbQLHocBong;
GO

-- =======================================================
-- TẠO BẢNG
-- =======================================================

-- Bảng Tài khoản
CREATE TABLE [TAIKHOAN] (
  [MaTK] int PRIMARY KEY IDENTITY(1,1),
  [TenDangNhap] varchar(100) NOT NULL UNIQUE,
  [MatKhau] varchar(255) NOT NULL,
  [VaiTro] varchar(50) NOT NULL,
  [TrangThai] bit DEFAULT 1,
  CONSTRAINT CHK_VaiTro CHECK ([VaiTro] IN ('Admin', 'SinhVien', 'Khoa', 'CTSV', 'DaoTao', 'KHTC', 'HoiDong', 'HieuTruong'))
);
GO

-- Bảng Phòng ban
CREATE TABLE [PHONGBAN] (
  [MaPhong] int PRIMARY KEY IDENTITY(1,1),
  [TenPhong] nvarchar(150) NOT NULL CONSTRAINT UQ_TenPhong UNIQUE
);
GO

-- Bảng Cán bộ
CREATE TABLE [CANBO] (
  [MaCB] int PRIMARY KEY IDENTITY(1,1),
  [HoTen] nvarchar(150) NOT NULL,
  [Email] varchar(100) NOT NULL CONSTRAINT CHK_Email_CanBo CHECK ([Email] LIKE '%_@_%._%'),
  [ChucVu] nvarchar(100),
  [MaPhong] int,
  [MaKhoa] int,
  [MaTK] int UNIQUE
);
GO

-- Bảng Khoa
CREATE TABLE [KHOA] (
  [MaKhoa] int PRIMARY KEY IDENTITY(1,1),
  [TenKhoa] nvarchar(150) NOT NULL CONSTRAINT UQ_TenKhoa UNIQUE
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
  [MaSV] varchar(20) PRIMARY KEY, 
  [HoTen] nvarchar(150) NOT NULL,
  [NgaySinh] date CONSTRAINT CHK_NgaySinh CHECK ([NgaySinh] < GETDATE()),
  [Email] varchar(100) NOT NULL CONSTRAINT CHK_Email_SV CHECK ([Email] LIKE '%_@_%._%'),
  [SDT] varchar(15) CONSTRAINT CHK_SDT_SV CHECK (LEN([SDT]) >= 9 AND [SDT] NOT LIKE '%[^0-9]%'),
  [MaLop] int NOT NULL,
  [MaTK] int UNIQUE
);
GO

-- Bảng Kết quả học tập
CREATE TABLE [KETQUAHOCTAP] (
  [MaDiem] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL CONSTRAINT CHK_HocKy_KQHT CHECK ([HocKy] IN (1, 2, 3)),
  [NamHoc] varchar(20) NOT NULL,
  [GPA] real NOT NULL CONSTRAINT CHK_GPA CHECK ([GPA] >= 0.0 AND [GPA] <= 4.0),
  [DiemHocTap] real NOT NULL DEFAULT 0, -- THÊM MỚI
  [CoDiemF] bit NOT NULL DEFAULT 0,     -- THÊM MỚI
  [SoTC] int NOT NULL CONSTRAINT CHK_SoTC CHECK ([SoTC] > 0),
  [MaCB_Nhap] int 
);
GO

-- Bảng Điểm rèn luyện
CREATE TABLE [DIEMRENLUYEN] (
  [MaDRL] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL CONSTRAINT CHK_HocKy_DRL CHECK ([HocKy] IN (1, 2, 3)),
  [NamHoc] varchar(20) NOT NULL,
  [DiemSo] int NOT NULL CONSTRAINT CHK_DiemSo_DRL CHECK ([DiemSo] >= 0 AND [DiemSo] <= 100),
  [MaCB_Nhap] int 
);
GO

-- Bảng Đợt học bổng
CREATE TABLE [DOTHOCBONG] (
  [MaDot] int PRIMARY KEY IDENTITY(1,1),
  [LoaiDot] nvarchar(150) NOT NULL, 
  [HocKy] int NOT NULL,
  [NamHoc] varchar(20) NOT NULL,
  [TrangThai] varchar(50) DEFAULT 'KhoiTao' CONSTRAINT CHK_TrangThai_Dot CHECK ([TrangThai] IN ('KhoiTao','DaCoDiem', 'DangXetDuyet', 'DuKien', 'CongBoLayYKien', 'LayYKienHoanTat', 'ChoPheDuyet', 'ChinhThuc')),
  [LyDoTraVe] nvarchar(500),
  [NgayCongBo] datetime NULL -- Cột mới thêm để đếm 10 ngày
);
GO

-- Bảng Hồ sơ xét học bổng
CREATE TABLE [HOSOXETHOCBONG] (
  [MaHoSo] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [MaDot] int NOT NULL,
  [NgayNop] datetime DEFAULT GETDATE(),
  [DiemHocTap] real NOT NULL CONSTRAINT CHK_GPA_HoSo CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 10.0),
  [GPA] real NOT NULL DEFAULT 0, -- THÊM MỚI
  [DiemRenLuyen] int NOT NULL CONSTRAINT CHK_DiemRenLuyen CHECK ([DiemRenLuyen] >= 0 AND [DiemRenLuyen] <= 100),
  [XepLoaiHB] nvarchar(50),
  [MucHocBong] decimal(18,2) NULL, -- THÊM MỚI: Mức học bổng được phê duyệt
  [TrangThai] varchar(50) DEFAULT 'ChoXet' CONSTRAINT CHK_TrangThai_HoSo CHECK ([TrangThai] IN ('ChoXet', 'KhoaDeXuat', 'HoiDongDuyet', 'TuChoi', 'ChinhThuc', 'Loai')),
  [GhiChu] nvarchar(MAX) NULL, -- THÊM MỚI
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
  [TrangThai] varchar(50) DEFAULT 'ChoXuLy' CONSTRAINT CHK_TrangThai_KhieuNai CHECK ([TrangThai] IN ('ChoXuLy', 'DaXuLy')),
  [MaCB_Duyet] int,
  [NoiDungPhanHoi] nvarchar(MAX),
  [NgayPhanHoi] datetime
);
GO

-- Bảng Danh sách Học bổng
CREATE TABLE [DSHOCBONG] (
  [MaDS] int PRIMARY KEY IDENTITY(1,1),
  [MaDot] int NOT NULL,
  [MaSV] varchar(20) NOT NULL,
  [XepLoai] nvarchar(50),
  [SoTien] decimal(18,2) NOT NULL CONSTRAINT CHK_SoTien_DS CHECK ([SoTien] >= 0),
  [NgayPheDuyet] datetime DEFAULT GETDATE(),
  [MaCB_PheDuyet] int NOT NULL
);
GO

-- Bảng Chi trả
CREATE TABLE [CHITRA] (
  [MaChiTra] int PRIMARY KEY IDENTITY(1,1),
  [MaHoSo] int NOT NULL,
  [SoTien] decimal(18,2) NOT NULL CONSTRAINT CHK_SoTien_ChiTra CHECK ([SoTien] >= 0),
  [NgayXacNhan] datetime,
  [TrangThai] varchar(50) DEFAULT 'ChuaGiaiNgan' CONSTRAINT CHK_TrangThai_ChiTra CHECK ([TrangThai] IN ('ChuaGiaiNgan', 'DaGiaiNgan')),
  [MaCB_GiaiNgan] int
);
GO

-- Bảng Phân bổ kinh phí
CREATE TABLE [PHANBOKINHPHI] (
  [MaPhanBo] int PRIMARY KEY IDENTITY(1,1),
  [MaDot] int NOT NULL,
  [MaKhoa] int NOT NULL,
  [KinhPhi] decimal(18,2) NOT NULL CONSTRAINT CHK_KinhPhi CHECK ([KinhPhi] >= 0),
  [MucHBLoaiKha] decimal(18,2) NOT NULL CONSTRAINT CHK_MucHBLoaiKha CHECK ([MucHBLoaiKha] >= 0),
  [MucHBLoaiGioi] decimal(18,2) NOT NULL DEFAULT 0,     -- THÊM MỚI
  [MucHBLoaiXuatSac] decimal(18,2) NOT NULL DEFAULT 0   -- THÊM MỚI
);
GO

-- =======================================================
-- XỬ LÝ KHÓA NGOẠI 
-- =======================================================

ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaPhong]) REFERENCES [PHONGBAN] ([MaPhong]) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaTK]) REFERENCES [TAIKHOAN] ([MaTK]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE [LOP] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [SINHVIEN] ADD FOREIGN KEY ([MaLop]) REFERENCES [LOP] ([MaLop]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [SINHVIEN] ADD FOREIGN KEY ([MaTK]) REFERENCES [TAIKHOAN] ([MaTK]) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE [KETQUAHOCTAP] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [KETQUAHOCTAP] ADD FOREIGN KEY ([MaCB_Nhap]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [DIEMRENLUYEN] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [DIEMRENLUYEN] ADD FOREIGN KEY ([MaCB_Nhap]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [HOSOXETHOCBONG] ADD FOREIGN KEY ([MaCB_Duyet]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [KHIEUNAI] ADD FOREIGN KEY ([MaHoSo]) REFERENCES [HOSOXETHOCBONG] ([MaHoSo]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [KHIEUNAI] ADD FOREIGN KEY ([MaCB_Duyet]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaSV]) REFERENCES [SINHVIEN] ([MaSV]) ON UPDATE CASCADE ON DELETE NO ACTION;
ALTER TABLE [DSHOCBONG] ADD FOREIGN KEY ([MaCB_PheDuyet]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [CHITRA] ADD FOREIGN KEY ([MaHoSo]) REFERENCES [HOSOXETHOCBONG] ([MaHoSo]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [CHITRA] ADD FOREIGN KEY ([MaCB_GiaiNgan]) REFERENCES [CANBO] ([MaCB]) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]) ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE [PHANBOKINHPHI] ADD CONSTRAINT UQ_PhanBo_DotKhoa UNIQUE (MaDot, MaKhoa);

ALTER TABLE [HOSOXETHOCBONG] ADD CONSTRAINT UQ_HoSo_SVDot UNIQUE (MaSV, MaDot);
