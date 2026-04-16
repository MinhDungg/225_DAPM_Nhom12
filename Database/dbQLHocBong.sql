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

USE dbQLHocBong;
GO

-- Bảng Tài khoản (Dùng chung cho Sinh viên và Cán bộ/Giảng viên)
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

-- Bảng Cán bộ (Quản lý nhân sự các phòng ban, khoa, ban giám hiệu)
CREATE TABLE [CANBO] (
  [MaCB] int PRIMARY KEY IDENTITY(1,1),
  [HoTen] nvarchar(150) NOT NULL,
  [Email] varchar(100) NOT NULL CONSTRAINT CHK_Email_CanBo CHECK ([Email] LIKE '%_@_%._%'),
  [ChucVu] nvarchar(100),
  [MaPhong] int,
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

-- Bảng Kết quả học tập (Lưu GPA từng kỳ)
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
  [DiemHocTap] real NOT NULL CONSTRAINT CHK_GPA_HoSo CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 4.0),   -- MỚI: Đã đổi tên và dùng real (thay vì GPA)
  [DiemRenLuyen] int NOT NULL CONSTRAINT CHK_DiemRenLuyen CHECK ([DiemRenLuyen] >= 0 AND [DiemRenLuyen] <= 100),  -- MỚI: Lưu snapshot ĐRL tại thời điểm nộp hồ sơ
  -- [GPA] float NOT NULL,
  -- [DiemNCKH] float DEFAULT 0,
  -- [DiemHDCD] float DEFAULT 0,
  [XepLoaiHB] nvarchar(50),
  [TrangThai] varchar(50) DEFAULT 'ChoXet' CONSTRAINT CHK_TrangThai_HoSo CHECK ([TrangThai] IN ('ChoXet', 'KhoaDeXuat', 'HoiDongDuyet', 'TuChoi')),
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
  [MaCB_Duyet] int
);
GO

-- Bảng Danh sách Học bổng (Lưu vết Quyết định của Hiệu trưởng)
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

-- Bảng Chi trả (Giải ngân tiền từ KHTC)
CREATE TABLE [CHITRA] (
  [MaChiTra] int PRIMARY KEY IDENTITY(1,1),
  [MaHoSo] int NOT NULL,
  [SoTien] decimal(18,2) NOT NULL CONSTRAINT CHK_SoTien_ChiTra CHECK ([SoTien] >= 0),
  [NgayXacNhan] datetime,
  [TrangThai] varchar(50) DEFAULT 'ChuaGiaiNgan' CONSTRAINT CHK_TrangThai_ChiTra CHECK ([TrangThai] IN ('ChuaGiaiNgan', 'DaGiaiNgan')),
  [MaCB_GiaiNgan] int
);
GO

-- Bảng Phân bổ kinh phí (Lưu trữ ngân sách học bổng được cấp cho từng Khoa trong mỗi Đợt)
CREATE TABLE [PHANBOKINHPHI] (
  [MaPhanBo] int PRIMARY KEY IDENTITY(1,1),
  [MaDot] int NOT NULL,
  [MaKhoa] int NOT NULL,
  [KinhPhi] decimal(18,2) NOT NULL CONSTRAINT CHK_KinhPhi CHECK ([KinhPhi] >= 0),
  [MucHBLoaiKha] decimal(18,2) NOT NULL CONSTRAINT CHK_MucHBLoaiKha CHECK ([MucHBLoaiKha] >= 0)
);
GO

-- XỬ LÝ KHÓA NGOẠI 
-- Lưu ý: Cố ý sử dụng NO ACTION ở một số nhánh để SQL Server không báo lỗi Multiple Cascade Paths.

ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaPhong]) REFERENCES [PHONGBAN] ([MaPhong]) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE [CANBO] ADD FOREIGN KEY ([MaTK]) REFERENCES [TAIKHOAN] ([MaTK]) ON UPDATE CASCADE ON DELETE CASCADE;

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
GO

-- Khóa ngoại bảng Phân bổ kinh phí
ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaDot]) REFERENCES [DOTHOCBONG] ([MaDot]);
ALTER TABLE [PHANBOKINHPHI] ADD FOREIGN KEY ([MaKhoa]) REFERENCES [KHOA] ([MaKhoa]);
GO

ALTER TABLE [PHANBOKINHPHI] ADD CONSTRAINT UQ_PhanBo_DotKhoa UNIQUE (MaDot, MaKhoa);

USE dbQLHocBong;
GO
-- 1. DANH MỤC CƠ BẢN
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

-- 4. ĐIỂM HỌC TẬP VÀ RÈN LUYỆN
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, SoTC, MaCB_Nhap) VALUES 
('23115053101', 1, '2023-2024', 3.8, 18, 1), ('23115053102', 1, '2023-2024', 3.6, 18, 1),
('23115053103', 1, '2023-2024', 2.5, 15, 1), ('23115053104', 1, '2023-2024', 3.9, 20, 1),
('23115053105', 1, '2023-2024', 3.2, 18, 1), ('23115053106', 1, '2023-2024', 3.7, 18, 1),
('23115053107', 1, '2023-2024', 3.5, 18, 1), ('23115053108', 1, '2023-2024', 3.1, 15, 1),
('23115053109', 1, '2023-2024', 3.8, 20, 1), ('23115053110', 1, '2023-2024', 2.8, 15, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('23115053101', 1, '2023-2024', 95, 2), ('23115053102', 1, '2023-2024', 90, 2),
('23115053103', 1, '2023-2024', 65, 2), ('23115053104', 1, '2023-2024', 98, 2),
('23115053105', 1, '2023-2024', 80, 2), ('23115053106', 1, '2023-2024', 85, 2),
('23115053107', 1, '2023-2024', 88, 2), ('23115053108', 1, '2023-2024', 75, 2),
('23115053109', 1, '2023-2024', 92, 2), ('23115053110', 1, '2023-2024', 70, 2);

-- 5. ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Khuyến khích học tập HK1', 1, '2023-2024', 'ChinhThuc'),
(N'Khuyến khích học tập HK2', 2, '2023-2024', 'DangXetDuyet');

INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha) VALUES 
(1, 1, 200000000, 5000000), (1, 2, 150000000, 5000000), (1, 3, 100000000, 4500000),
(2, 1, 250000000, 5500000), (2, 2, 150000000, 5000000);

-- 6. HỒ SƠ XÉT HỌC BỔNG 
-- 6. HỒ SƠ XÉT HỌC BỔNG 
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, DiemHocTap, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('23115053101', 1, '2024-02-10', 3.8, 95, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053102', 1, '2024-02-11', 3.6, 90, N'Giỏi', 'HoiDongDuyet', 4),
('23115053104', 1, '2024-02-12', 3.9, 98, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053106', 1, '2024-02-12', 3.7, 85, N'Giỏi', 'HoiDongDuyet', 4),
('23115053109', 1, '2024-02-13', 3.8, 92, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053107', 1, '2024-02-14', 3.5, 88, N'Giỏi', 'HoiDongDuyet', 4),
('23115053105', 1, '2024-02-14', 3.2, 80, N'Khá', 'HoiDongDuyet', 4),
('23115053103', 1, '2024-02-15', 2.5, 65, NULL, 'TuChoi', 4),
('23115053108', 1, '2024-02-16', 3.1, 75, NULL, 'TuChoi', 4),
('23115053110', 1, '2024-02-16', 2.8, 70, NULL, 'ChoXet', NULL);
-- 7. KHIẾU NẠI
INSERT INTO [KHIEUNAI] (MaHoSo, NoiDung, MinhChung, NgayGui, TrangThai, MaCB_Duyet) VALUES 
(8, N'Lỗi hệ thống ghi nhận thiếu điểm rèn luyện', 'link_driver_1', '2024-02-20', 'DaXuLy', 2),
(9, N'Chưa cộng điểm ban cán sự lớp', 'link_driver_2', '2024-02-21', 'DaXuLy', 4),
(10, N'Lỗi cập nhật tín chỉ học tập', 'link_driver_3', '2024-02-22', 'ChoXuLy', NULL);

-- 8. DANH SÁCH HỌC BỔNG ĐƯỢC DUYỆT 
INSERT INTO [DSHOCBONG] (MaDot, MaSV, XepLoai, SoTien, NgayPheDuyet, MaCB_PheDuyet) VALUES 
(1, '23115053101', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053102', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053104', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053106', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053109', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053107', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053105', N'Khá', 5000000, '2024-03-01', 6);

-- 9. CHI TRẢ 
INSERT INTO [CHITRA] (MaHoSo, SoTien, NgayXacNhan, TrangThai, MaCB_GiaiNgan) VALUES 
(1, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(2, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(3, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(4, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(5, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(6, 6500000, NULL, 'ChuaGiaiNgan', NULL),
(7, 5000000, NULL, 'ChuaGiaiNgan', NULL);
GO