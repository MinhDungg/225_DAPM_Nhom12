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

CREATE TABLE [TAIKHOAN] (
  [MaTK] int PRIMARY KEY IDENTITY(1,1),
  [TenDangNhap] varchar(100) NOT NULL UNIQUE,
  [MatKhau] varchar(255) NOT NULL,
  [VaiTro] varchar(50) NOT NULL,
  [TrangThai] bit DEFAULT 1,
  CONSTRAINT CHK_VaiTro CHECK ([VaiTro] IN ('Admin', 'SinhVien', 'Khoa', 'CTSV', 'DaoTao', 'KHTC', 'HoiDong', 'HieuTruong'))
);
GO

CREATE TABLE [PHONGBAN] (
  [MaPhong] int PRIMARY KEY IDENTITY(1,1),
  [TenPhong] nvarchar(150) NOT NULL CONSTRAINT UQ_TenPhong UNIQUE
);
GO

CREATE TABLE [CANBO] (
  [MaCB] int PRIMARY KEY IDENTITY(1,1),
  [HoTen] nvarchar(150) NOT NULL,
  [Email] varchar(100) NOT NULL CONSTRAINT CHK_Email_CanBo CHECK ([Email] LIKE '%_@_%._%'),
  [ChucVu] nvarchar(100),
  [MaPhong] int,
  [MaTK] int UNIQUE
);
GO

CREATE TABLE [KHOA] (
  [MaKhoa] int PRIMARY KEY IDENTITY(1,1),
  [TenKhoa] nvarchar(150) NOT NULL CONSTRAINT UQ_TenKhoa UNIQUE
);
GO

CREATE TABLE [LOP] (
  [MaLop] int PRIMARY KEY IDENTITY(1,1),
  [TenLop] nvarchar(100) NOT NULL,
  [MaKhoa] int NOT NULL
);
GO

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

CREATE TABLE [KETQUAHOCTAP] (
  [MaDiem] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL CONSTRAINT CHK_HocKy_KQHT CHECK ([HocKy] IN (1, 2, 3)),
  [NamHoc] varchar(20) NOT NULL,
  [GPA] float NOT NULL CONSTRAINT CHK_GPA CHECK ([GPA] >= 0.0 AND [GPA] <= 4.0),
  [SoTC] int NOT NULL CONSTRAINT CHK_SoTC CHECK ([SoTC] > 0),
  [MaCB_Nhap] int 
);
GO

CREATE TABLE [DIEMRENLUYEN] (
  [MaDRL] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [HocKy] int NOT NULL CONSTRAINT CHK_HocKy_DRL CHECK ([HocKy] IN (1, 2, 3)),
  [NamHoc] varchar(20) NOT NULL,
  [DiemSo] int NOT NULL CONSTRAINT CHK_DiemSo_DRL CHECK ([DiemSo] >= 0 AND [DiemSo] <= 100),
  [MaCB_Nhap] int 
);
GO

CREATE TABLE [DOTHOCBONG] (
  [MaDot] int PRIMARY KEY IDENTITY(1,1),
  [LoaiDot] nvarchar(150) NOT NULL, 
  [HocKy] int NOT NULL,
  [NamHoc] varchar(20) NOT NULL,
  [TrangThai] varchar(50) DEFAULT 'KhoiTao' CONSTRAINT CHK_TrangThai_Dot CHECK ([TrangThai] IN ('KhoiTao', 'DangXetDuyet', 'DuKien', 'ChinhThuc'))
);
GO

CREATE TABLE [HOSOXETHOCBONG] (
  [MaHoSo] int PRIMARY KEY IDENTITY(1,1),
  [MaSV] varchar(20) NOT NULL,
  [MaDot] int NOT NULL,
  [NgayNop] datetime DEFAULT GETDATE(),
  [GPA] float NOT NULL CONSTRAINT CHK_GPA_HoSo CHECK ([GPA] >= 0.0 AND [GPA] <= 4.0),
  [DiemNCKH] float DEFAULT 0 CONSTRAINT CHK_DiemNCKH CHECK ([DiemNCKH] >= 0),
  [DiemHDCD] float DEFAULT 0 CONSTRAINT CHK_DiemHDCD CHECK ([DiemHDCD] >= 0),
  [XepLoaiHB] nvarchar(50),
  [TrangThai] varchar(50) DEFAULT 'ChoXet' CONSTRAINT CHK_TrangThai_HoSo CHECK ([TrangThai] IN ('ChoXet', 'KhoaDeXuat', 'HoiDongDuyet', 'TuChoi')),
  [MaCB_Duyet] int
);
GO

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

CREATE TABLE [CHITRA] (
  [MaChiTra] int PRIMARY KEY IDENTITY(1,1),
  [MaHoSo] int NOT NULL,
  [SoTien] decimal(18,2) NOT NULL CONSTRAINT CHK_SoTien_ChiTra CHECK ([SoTien] >= 0),
  [NgayXacNhan] datetime,
  [TrangThai] varchar(50) DEFAULT 'ChuaGiaiNgan' CONSTRAINT CHK_TrangThai_ChiTra CHECK ([TrangThai] IN ('ChuaGiaiNgan', 'DaGiaiNgan')),
  [MaCB_GiaiNgan] int
);
GO

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
USE dbQLHocBong;
GO
-- 1. DANH MỤC CƠ BẢN
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'), (N'Phòng Công tác Sinh viên'), 
(N'Phòng Kế hoạch Tài chính'), (N'Ban Giám Hiệu');

INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Thông tin'), (N'Khoa Điện - Điện tử'), (N'Khoa Cơ khí');

INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), ('23T2', 1), ('23D1', 2), ('23D2', 2), ('23C1', 3);

-- 2. TÀI KHOẢN & CÁN BỘ
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('daotao', '123456', 'DaoTao', 1), ('ctsv', '123456', 'CTSV', 1),
('khtc', '123456', 'KHTC', 1), ('khoacntt', '123456', 'Khoa', 1),
('hoidong', '123456', 'HoiDong', 1), ('hieutruong', '123456', 'HieuTruong', 1);

INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES 
(N'Phạm Thị Đào Tạo', 'daotao@ute.edu.vn', N'Chuyên viên', 1, 1),
(N'Trần Thị CTSV', 'ctsv@ute.edu.vn', N'Chuyên viên', 2, 2),
(N'Lê Văn KHTC', 'khtc@ute.edu.vn', N'Chuyên viên', 3, 3),
(N'Nguyễn Văn Khoa', 'khoacntt@ute.edu.vn', N'Trưởng Khoa', NULL, 4),
(N'Hội Đồng Trường', 'hoidong@ute.edu.vn', N'Chủ tịch', 4, 5),
(N'Nguyễn Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, 6);

-- 3. TÀI KHOẢN & SINH VIÊN
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('23115053101', '123456', 'SinhVien', 1), ('23115053102', '123456', 'SinhVien', 1),
('23115053103', '123456', 'SinhVien', 1), ('23115053104', '123456', 'SinhVien', 1),
('23115053105', '123456', 'SinhVien', 1), ('23115053106', '123456', 'SinhVien', 1),
('23115053107', '123456', 'SinhVien', 1), ('23115053108', '123456', 'SinhVien', 1),
('23115053109', '123456', 'SinhVien', 1), ('23115053110', '123456', 'SinhVien', 1);

INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('23115053101', N'Nguyễn Văn An', '2005-01-15', 'an.nv@sv.ute.edu.vn', '0901000001', 1, 7),
('23115053102', N'Trần Thị Bình', '2005-02-14', 'binh.tt@sv.ute.edu.vn', '0901000002', 1, 8),
('23115053103', N'Lê Hoàng Cường', '2005-03-20', 'cuong.lh@sv.ute.edu.vn', '0901000003', 2, 9),
('23115053104', N'Phạm Mỹ Dung', '2005-04-10', 'dung.pm@sv.ute.edu.vn', '0901000004', 2, 10),
('23115053105', N'Hoàng Tuấn Em', '2005-05-05', 'em.ht@sv.ute.edu.vn', '0901000005', 3, 11),
('23115053106', N'Đặng Thu Phương', '2005-06-12', 'phuong.dt@sv.ute.edu.vn', '0901000006', 3, 12),
('23115053107', N'Bùi Quang Huy', '2005-07-22', 'huy.bq@sv.ute.edu.vn', '0901000007', 4, 13),
('23115053108', N'Đỗ Minh Trí', '2005-08-08', 'tri.dm@sv.ute.edu.vn', '0901000008', 4, 14),
('23115053109', N'Hồ Bảo Ngọc', '2005-09-19', 'ngoc.hb@sv.ute.edu.vn', '0901000009', 5, 15),
('23115053110', N'Ngô Gia Long', '2005-10-30', 'long.ng@sv.ute.edu.vn', '0901000010', 5, 16);

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
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, GPA, DiemNCKH, DiemHDCD, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('23115053101', 1, '2024-02-10', 3.8, 2.0, 1.0, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053102', 1, '2024-02-11', 3.6, 0.0, 1.5, N'Giỏi', 'HoiDongDuyet', 4),
('23115053104', 1, '2024-02-12', 3.9, 5.0, 2.0, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053106', 1, '2024-02-12', 3.7, 0.0, 0.0, N'Giỏi', 'HoiDongDuyet', 4),
('23115053109', 1, '2024-02-13', 3.8, 1.0, 2.0, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053107', 1, '2024-02-14', 3.5, 0.0, 3.0, N'Giỏi', 'HoiDongDuyet', 4),
('23115053105', 1, '2024-02-14', 3.2, 0.0, 5.0, N'Khá', 'HoiDongDuyet', 4),
('23115053103', 1, '2024-02-15', 2.5, 0.0, 0.0, NULL, 'TuChoi', 4),
('23115053108', 1, '2024-02-16', 3.1, 0.0, 1.0, NULL, 'TuChoi', 4),
('23115053110', 1, '2024-02-16', 2.8, 0.0, 0.0, NULL, 'ChoXet', NULL);

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