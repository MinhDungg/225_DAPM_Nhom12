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
  [TrangThai] varchar(50) DEFAULT 'KhoiTao' CONSTRAINT CHK_TrangThai_Dot CHECK ([TrangThai] IN ('KhoiTao', 'DangXetDuyet', 'DuKien', 'ChinhThuc'))
);
GO

-- Bảng Hồ sơ xét học bổng
CREATE TABLE [HOSOXETHOCBONG] (
  [MaHoSo] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [MaDot] int NOT NULL,
  [NgayNop] datetime DEFAULT GETDATE(),
  [DiemHocTap] real NOT NULL CONSTRAINT CHK_GPA_HoSo CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 4.0),
  [DiemRenLuyen] int NOT NULL CONSTRAINT CHK_DiemRenLuyen CHECK ([DiemRenLuyen] >= 0 AND [DiemRenLuyen] <= 100),
  [XepLoaiHB] nvarchar(50),
  [TrangThai] varchar(50) DEFAULT 'ChoXet' CONSTRAINT CHK_TrangThai_HoSo CHECK ([TrangThai] IN ('ChoXet', 'KhoaDeXuat', 'HoiDongDuyet', 'TuChoi', 'ChinhThuc')),
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
  [MucHBLoaiKha] decimal(18,2) NOT NULL CONSTRAINT CHK_MucHBLoaiKha CHECK ([MucHBLoaiKha] >= 0)
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
GO


-- =================================================================================
-- THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================

-- Thêm Phòng ban
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'),             -- ID: 1
(N'Phòng Công tác Sinh viên'),  -- ID: 2
(N'Phòng Kế hoạch Tài chính'),  -- ID: 3
(N'Ban Giám Hiệu');             -- ID: 4

-- Thêm Khoa (Bổ sung thêm 2 khoa để khớp với bảng phân bổ kinh phí)
INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Thông tin'),  -- ID: 1
(N'Khoa Điện - Điện Tử'),       -- ID: 2
(N'Khoa Cơ Khí');               -- ID: 3

-- Thêm Lớp (Chia làm 2 lớp thuộc Khoa CNTT)
INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), -- ID: 1
('23T2', 1); -- ID: 2

-- =================================================================================
-- THÊM TÀI KHOẢN & CÁN BỘ
-- =================================================================================

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('daotao', '123456', 'DaoTao', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Phạm Thị Đào Tạo', 'daotao@ute.edu.vn', N'Chuyên viên Đào tạo', 1, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('ctsv', '123456', 'CTSV', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Trần Thị CTSV', 'ctsv@ute.edu.vn', N'Chuyên viên CTSV', 2, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khtc', '123456', 'KHTC', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Lê Văn KHTC', 'khtc@ute.edu.vn', N'Chuyên viên KHTC', 3, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khoacntt', '123456', 'Khoa', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaKhoa, MaTK) VALUES (N'Nguyễn Văn Khoa', 'khoacntt@ute.edu.vn', N'Trưởng Khoa', NULL, 1, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hoidong', '123456', 'HoiDong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Hội Đồng Trường', 'hoidong@ute.edu.vn', N'Chủ tịch Hội đồng', 4, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hieutruong', '123456', 'HieuTruong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Nguyễn Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, IDENT_CURRENT('TAIKHOAN'));


-- =================================================================================
-- THÊM 10 TÀI KHOẢN & SINH VIÊN 
-- =================================================================================

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

-- ĐIỂM HỌC TẬP VÀ RÈN LUYỆN
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, SoTC, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 3.8, 18, 1), ('23115053122102', 1, '2023-2024', 3.6, 18, 1),
('23115053122103', 1, '2023-2024', 2.5, 15, 1), ('23115053122104', 1, '2023-2024', 3.9, 20, 1),
('23115053122105', 1, '2023-2024', 3.2, 18, 1), ('23115053122106', 1, '2023-2024', 3.7, 18, 1),
('23115053122107', 1, '2023-2024', 3.5, 18, 1), ('23115053122108', 1, '2023-2024', 3.1, 15, 1),
('23115053122109', 1, '2023-2024', 3.8, 20, 1), ('23115053122110', 1, '2023-2024', 2.8, 15, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 95, 2), ('23115053122102', 1, '2023-2024', 90, 2),
('23115053122103', 1, '2023-2024', 65, 2), ('23115053122104', 1, '2023-2024', 98, 2),
('23115053122105', 1, '2023-2024', 80, 2), ('23115053122106', 1, '2023-2024', 85, 2),
('23115053122107', 1, '2023-2024', 88, 2), ('23115053122108', 1, '2023-2024', 75, 2),
('23115053122109', 1, '2023-2024', 92, 2), ('23115053122110', 1, '2023-2024', 70, 2);

-- ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Khuyến khích học tập HK1', 1, '2023-2024', 'ChinhThuc'),
(N'Khuyến khích học tập HK2', 2, '2023-2024', 'DangXetDuyet');

INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha) VALUES 
(1, 1, 200000000, 5000000), (1, 2, 150000000, 5000000), (1, 3, 100000000, 4500000),
(2, 1, 250000000, 5500000), (2, 2, 150000000, 5000000);

-- HỒ SƠ XÉT HỌC BỔNG 
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, DiemHocTap, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
-- Đợt 1 (Đã chốt)
('23115053122101', 1, '2024-02-10', 3.8, 95, N'Xuất sắc', 'ChinhThuc', 4),
('23115053122102', 1, '2024-02-11', 3.6, 90, N'Giỏi', 'ChinhThuc', 4),
('23115053122104', 1, '2024-02-12', 3.9, 98, N'Xuất sắc', 'ChinhThuc', 4),
('23115053122106', 1, '2024-02-12', 3.7, 85, N'Giỏi', 'ChinhThuc', 4),
('23115053122109', 1, '2024-02-13', 3.8, 92, N'Xuất sắc', 'ChinhThuc', 4),
('23115053122107', 1, '2024-02-14', 3.5, 88, N'Giỏi', 'ChinhThuc', 4),
('23115053122105', 1, '2024-02-14', 3.2, 80, N'Khá', 'ChinhThuc', 4),
('23115053122103', 1, '2024-02-15', 2.5, 65, NULL, 'TuChoi', 4),
('23115053122108', 1, '2024-02-16', 3.1, 75, NULL, 'TuChoi', 4),
('23115053122110', 1, '2024-02-16', 2.8, 70, NULL, 'ChoXet', NULL),

-- Đợt 2 (Chờ Hiệu trưởng duyệt)
('23115053122101', 2, '2024-06-10', 3.8, 95, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053122102', 2, '2024-06-11', 3.6, 90, N'Giỏi', 'HoiDongDuyet', 4),
('23115053122104', 2, '2024-06-12', 3.9, 98, N'Xuất sắc', 'HoiDongDuyet', 4);

-- KHIẾU NẠI
INSERT INTO [KHIEUNAI] (MaHoSo, NoiDung, MinhChung, NgayGui, TrangThai, MaCB_Duyet, NoiDungPhanHoi, NgayPhanHoi) VALUES 
(8, N'Lỗi hệ thống ghi nhận thiếu điểm rèn luyện', 'link_driver_1', '2024-02-20', 'DaXuLy', 2, N'Đã kiểm tra và cập nhật lại điểm rèn luyện cho sinh viên. Vui lòng kiểm tra lại.', '2024-02-25'),
(9, N'Chưa cộng điểm ban cán sự lớp', 'link_driver_2', '2024-02-21', 'DaXuLy', 4, N'Đã bổ sung điểm cộng ban cán sự lớp vào hồ sơ. Cảm ơn bạn đã phản ánh.', '2024-02-26'),
(10, N'Lỗi cập nhật tín chỉ học tập', 'link_driver_3', '2024-02-22', 'ChoXuLy', NULL, NULL, NULL);

-- DANH SÁCH HỌC BỔNG ĐƯỢC DUYỆT 
INSERT INTO [DSHOCBONG] (MaDot, MaSV, XepLoai, SoTien, NgayPheDuyet, MaCB_PheDuyet) VALUES 
(1, '23115053122101', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122102', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122104', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122106', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122109', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122107', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122105', N'Khá', 5000000, '2024-03-01', 6);

-- CHI TRẢ 
INSERT INTO [CHITRA] (MaHoSo, SoTien, NgayXacNhan, TrangThai, MaCB_GiaiNgan) VALUES 
(1, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(2, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(3, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(4, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(5, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(6, 6500000, NULL, 'ChuaGiaiNgan', NULL),
(7, 5000000, NULL, 'ChuaGiaiNgan', NULL);

GO

-- ================================================
-- KIỂM TRA DỮ LIỆU HIỆN TẠI (ĐÃ FIX CỘT GPA -> DiemHocTap)
-- ================================================
SELECT 'DOTHOCBONG' AS Bang, COUNT(*) AS SoLuong FROM DOTHOCBONG
UNION ALL
SELECT 'HOSOXETHOCBONG', COUNT(*) FROM HOSOXETHOCBONG
UNION ALL
SELECT 'SINHVIEN', COUNT(*) FROM SINHVIEN
UNION ALL
SELECT 'LOP', COUNT(*) FROM LOP;
GO

-- Kiểm tra truy vấn lấy danh sách Chờ xét của Khoa CNTT
SELECT 
    hs.MaHoSo,
    hs.MaSV,
    sv.HoTen,
    hs.MaDot,
    hs.TrangThai,
    sv.MaLop,
    l.MaKhoa,
    hs.DiemHocTap
FROM HOSOXETHOCBONG hs
JOIN SINHVIEN sv ON hs.MaSV = sv.MaSV
JOIN LOP l ON sv.MaLop = l.MaLop
WHERE l.MaKhoa = 1 
  AND hs.MaDot = 1
  AND hs.TrangThai = 'ChoXet';
GO