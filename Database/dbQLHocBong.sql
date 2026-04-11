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
  [MaKhoa] int,
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

-- Bảng Phân bổ kinh phí (Lưu trữ ngân sách học bổng được cấp cho từng Khoa trong mỗi Đợt)
CREATE TABLE [PHANBOKINHPHI] (
  [MaPhanBo] int PRIMARY KEY IDENTITY(1,1),
  [MaDot] int NOT NULL,
  [MaKhoa] int NOT NULL,
  [KinhPhi] decimal(18,2) NOT NULL,
  [MucHBLoaiKha] decimal(18,2) NOT NULL
);
GO

-- 3. TẠO KHÓA NGOẠI (FOREIGN KEYS)

-- Khóa ngoại bảng Cán bộ
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaPhong]) REFERENCES [PHONGBAN] ([MaPhong]);
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]);
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

-- Khóa ngoại bảng Phân bổ kinh phí
ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]);
ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]);
GO

USE dbQLHocBong;
GO

-- =================================================================================
-- 1. THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================

-- Thêm Phòng ban
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'),             -- ID: 1
(N'Phòng Công tác Sinh viên'),  -- ID: 2
(N'Phòng Kế hoạch Tài chính'),  -- ID: 3
(N'Ban Giám Hiệu');             -- ID: 4

-- Thêm Khoa
INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Thông tin');  -- ID: 1

-- Thêm Lớp (Chia làm 2 lớp thuộc Khoa CNTT)
INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), -- ID: 1
('23T2', 1); -- ID: 2

-- =================================================================================
-- 2. THÊM TÀI KHOẢN & CÁN BỘ CHO 6 TÁC NHÂN (KHÔNG CÓ ADMIN)
-- =================================================================================

-- 1. Tác nhân: Đào Tạo
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('daotao', '123456', 'DaoTao', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Phạm Thị Đào Tạo', 'daotao@ute.edu.vn', N'Chuyên viên Đào tạo', 1, IDENT_CURRENT('TAIKHOAN'));

-- 2. Tác nhân: CTSV
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('ctsv', '123456', 'CTSV', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Trần Thị CTSV', 'ctsv@ute.edu.vn', N'Chuyên viên CTSV', 2, IDENT_CURRENT('TAIKHOAN'));

-- 3. Tác nhân: KHTC
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khtc', '123456', 'KHTC', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Lê Văn KHTC', 'khtc@ute.edu.vn', N'Chuyên viên KHTC', 3, IDENT_CURRENT('TAIKHOAN'));

-- 4. Tác nhân: Khoa
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khoacntt', '123456', 'Khoa', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Nguyễn Văn Khoa', 'khoacntt@ute.edu.vn', N'Trưởng Khoa', NULL, IDENT_CURRENT('TAIKHOAN'));

-- 5. Tác nhân: Hội đồng
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hoidong', '123456', 'HoiDong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Hội Đồng Trường', 'hoidong@ute.edu.vn', N'Chủ tịch Hội đồng', 4, IDENT_CURRENT('TAIKHOAN'));

-- 6. Tác nhân: Hiệu trưởng
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hieutruong', '123456', 'HieuTruong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Nguyễn Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, IDENT_CURRENT('TAIKHOAN'));


-- =================================================================================
-- 3. THÊM 10 TÀI KHOẢN & SINH VIÊN (Mã từ 23115053122101 đến 23115053122110)
-- =================================================================================

-- 3.1. Insert 10 dòng vào bảng TAIKHOAN trước
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('23115053122101', '123456', 'SinhVien', 1),
('23115053122102', '123456', 'SinhVien', 1),
('23115053122103', '123456', 'SinhVien', 1),
('23115053122104', '123456', 'SinhVien', 1),
('23115053122105', '123456', 'SinhVien', 1),
('23115053122106', '123456', 'SinhVien', 1),
('23115053122107', '123456', 'SinhVien', 1),
('23115053122108', '123456', 'SinhVien', 1),
('23115053122109', '123456', 'SinhVien', 1),
('23115053122110', '123456', 'SinhVien', 1);

-- 3.2. Insert 10 dòng vào bảng SINHVIEN (Tìm lại MaTK qua TenDangNhap)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('23115053122101', N'Nguyễn Sinh Viên 01', '2005-01-15', 'sv01@sv.ute.edu.vn', '0901000001', 1, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122101')),
('23115053122102', N'Trần Sinh Viên 02', '2005-02-14', 'sv02@sv.ute.edu.vn', '0901000002', 1, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122102')),
('23115053122103', N'Lê Sinh Viên 03', '2005-03-20', 'sv03@sv.ute.edu.vn', '0901000003', 1, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122103')),
('23115053122104', N'Phạm Sinh Viên 04', '2005-04-10', 'sv04@sv.ute.edu.vn', '0901000004', 1, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122104')),
('23115053122105', N'Hoàng Sinh Viên 05', '2005-05-05', 'sv05@sv.ute.edu.vn', '0901000005', 1, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122105')),
('23115053122106', N'Đặng Sinh Viên 06', '2005-06-12', 'sv06@sv.ute.edu.vn', '0901000006', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122106')),
('23115053122107', N'Bùi Sinh Viên 07', '2005-07-22', 'sv07@sv.ute.edu.vn', '0901000007', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122107')),
('23115053122108', N'Đỗ Sinh Viên 08', '2005-08-08', 'sv08@sv.ute.edu.vn', '0901000008', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122108')),
('23115053122109', N'Hồ Sinh Viên 09', '2005-09-19', 'sv09@sv.ute.edu.vn', '0901000009', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122109')),
('23115053122110', N'Ngô Sinh Viên 10', '2005-10-30', 'sv10@sv.ute.edu.vn', '0901000010', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122110'));

-- Thêm cột MaKhoa vào bảng CANBO
ALTER TABLE [CANBO] 
ADD [MaKhoa] int NULL;
GO

-- Tạo foreign key constraint
ALTER TABLE [CANBO] 
ADD CONSTRAINT FK_CANBO_KHOA 
FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA]([MaKhoa]);
GO

-- Update dữ liệu mẫu: Gán cán bộ Khoa CNTT vào Khoa có MaKhoa = 1
UPDATE [CANBO] 
SET [MaKhoa] = 1 
WHERE [ChucVu] = N'Trưởng Khoa';
GO

-- Tạo đợt học bổng mẫu
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) 
VALUES (N'Học bổng khuyến khích học tập', 1, '2023-2024', 'DangXetDuyet');
GO

-- Lấy MaDot vừa tạo
DECLARE @MaDot int = SCOPE_IDENTITY();

-- Thêm điểm rèn luyện cho sinh viên
INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap)
VALUES 
('23115053122101', 1, '2023-2024', 85, 2), -- Cán bộ CTSV nhập
('23115053122102', 1, '2023-2024', 90, 2),
('23115053122103', 1, '2023-2024', 80, 2),
('23115053122104', 1, '2023-2024', 88, 2),
('23115053122105', 1, '2023-2024', 92, 2);
GO

-- Thêm kết quả học tập cho sinh viên
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, SoTC, MaCB_Nhap)
VALUES 
('23115053122101', 1, '2023-2024', 3.5, 20, 1), -- Cán bộ Đào tạo nhập
('23115053122102', 1, '2023-2024', 3.8, 20, 1),
('23115053122103', 1, '2023-2024', 3.2, 20, 1),
('23115053122104', 1, '2023-2024', 3.6, 20, 1),
('23115053122105', 1, '2023-2024', 3.9, 20, 1);
GO

-- Thêm hồ sơ xét học bổng (trạng thái ChoXet)
-- Lấy MaDot đầu tiên
DECLARE @MaDotTest int = (SELECT TOP 1 MaDot FROM DOTHOCBONG ORDER BY MaDot DESC);

INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, GPA, DiemNCKH, DiemHDCD, XepLoaiHB, TrangThai, MaCB_Duyet)
VALUES 
('23115053122101', @MaDotTest, GETDATE(), 3.5, 5, 3, NULL, 'ChoXet', NULL),
('23115053122102', @MaDotTest, GETDATE(), 3.8, 8, 5, NULL, 'ChoXet', NULL),
('23115053122103', @MaDotTest, GETDATE(), 3.2, 2, 1, NULL, 'ChoXet', NULL),
('23115053122104', @MaDotTest, GETDATE(), 3.6, 6, 4, NULL, 'ChoXet', NULL),
('23115053122105', @MaDotTest, GETDATE(), 3.9, 10, 7, NULL, 'ChoXet', NULL);
GO