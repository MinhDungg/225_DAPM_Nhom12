USE dbQLHocBong;
GO

-- =================================================================================
-- 0. VÁ LỖI CONSTRAINT & XÓA DỮ LIỆU CŨ 
-- =================================================================================
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_GPA_HoSo')
BEGIN
    ALTER TABLE [HOSOXETHOCBONG] DROP CONSTRAINT [CHK_GPA_HoSo];
    ALTER TABLE [HOSOXETHOCBONG] ADD CONSTRAINT [CHK_GPA_HoSo] CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 10.0);
END
GO

DELETE FROM [CHITRA];
DELETE FROM [DSHOCBONG];
DELETE FROM [KHIEUNAI];
DELETE FROM [HOSOXETHOCBONG];
DELETE FROM [PHANBOKINHPHI];
DELETE FROM [DOTHOCBONG];
DELETE FROM [DIEMRENLUYEN];
DELETE FROM [KETQUAHOCTAP];
DELETE FROM [SINHVIEN];
DELETE FROM [LOP];
DELETE FROM [CANBO];
DELETE FROM [KHOA];
DELETE FROM [PHONGBAN];
DELETE FROM [TAIKHOAN];

DBCC CHECKIDENT ('[CHITRA]', RESEED, 0);
DBCC CHECKIDENT ('[DSHOCBONG]', RESEED, 0);
DBCC CHECKIDENT ('[KHIEUNAI]', RESEED, 0);
DBCC CHECKIDENT ('[HOSOXETHOCBONG]', RESEED, 0);
DBCC CHECKIDENT ('[PHANBOKINHPHI]', RESEED, 0);
DBCC CHECKIDENT ('[DOTHOCBONG]', RESEED, 0);
DBCC CHECKIDENT ('[DIEMRENLUYEN]', RESEED, 0);
DBCC CHECKIDENT ('[KETQUAHOCTAP]', RESEED, 0);
DBCC CHECKIDENT ('[LOP]', RESEED, 0);
DBCC CHECKIDENT ('[CANBO]', RESEED, 0);
DBCC CHECKIDENT ('[KHOA]', RESEED, 0);
DBCC CHECKIDENT ('[PHONGBAN]', RESEED, 0);
DBCC CHECKIDENT ('[TAIKHOAN]', RESEED, 0);
GO

-- =================================================================================
-- 1. THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================
-- Xem 10 dòng điểm học vụ mới nhất được nạp vào
SELECT TOP 10 * FROM KETQUAHOCTAP ORDER BY MaDiem DESC;

-- Xem 10 dòng điểm rèn luyện mới nhất được nạp vào
SELECT TOP 10 * FROM DIEMRENLUYEN ORDER BY MaDRL DESC;
go
SELECT * FROM DOTHOCBONG
SELECT * FROM PHANBOKINHPHI

go
-- Thêm Phòng ban
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'),             -- ID: 1
(N'Phòng Công tác Sinh viên'),  -- ID: 2
(N'Phòng Kế hoạch Tài chính'),  -- ID: 3
(N'Ban Giám Hiệu');             -- ID: 4

-- Thêm Khoa
INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Số'), (N'Khoa Điện - Điện tử'), (N'Khoa Cơ khí');

-- Thêm Lớp
INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), ('23T2', 1), ('23D1', 2);

-- =================================================================================
-- 2. THÊM TÀI KHOẢN & CÁN BỘ
-- =================================================================================
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('daotao', '123', 'DaoTao', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Phạm Thị Đào Tạo', 'daotao@ute.edu.vn', N'Chuyên viên', 1, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('ctsv', '123', 'CTSV', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Trần Thị CTSV', 'ctsv@ute.edu.vn', N'Chuyên viên', 2, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khtc', '123', 'KHTC', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Lê Văn KHTC', 'khtc@ute.edu.vn', N'Chuyên viên', 3, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('khoacns', '123', 'Khoa', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaKhoa, MaTK) VALUES (N'Nguyễn Văn Khoa', 'khoacns@ute.edu.vn', N'Trưởng Khoa', NULL, 1, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hoidong', '123', 'HoiDong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Hội Đồng Trường', 'hoidong@ute.edu.vn', N'Chủ tịch', 4, IDENT_CURRENT('TAIKHOAN'));

INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hieutruong', '123', 'HieuTruong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Nguyễn Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, IDENT_CURRENT('TAIKHOAN'));

-- =================================================================================
-- 3. THÊM TÀI KHOẢN & 30 SINH VIÊN
-- =================================================================================
DECLARE @i INT = 1;
DECLARE @MaSV VARCHAR(20);
WHILE @i <= 30
BEGIN
    SET @MaSV = 'SV' + RIGHT('000' + CAST(@i AS VARCHAR), 3);
    INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) 
    VALUES (@MaSV, '123456', 'SinhVien', 1);
    
    INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK)
    VALUES (
        @MaSV, 
        N'Nguyễn Sinh Viên ' + CAST(@i AS NVARCHAR), 
        '2005-01-01', 
        LOWER(@MaSV) + '@ute.edu.vn', 
        '0901000' + RIGHT('000' + CAST(@i AS VARCHAR), 3), 
        CASE 
            WHEN @i <= 10 THEN 1 -- Lớp 23T1 (Khoa CNS)
            WHEN @i <= 20 THEN 2 -- Lớp 23T2 (Khoa CNS)
            ELSE 3               -- Lớp 23D1 (Khoa Điện)
        END, 
        IDENT_CURRENT('TAIKHOAN')
    );
    SET @i = @i + 1;
END
GO

-- =================================================================================
-- 4. KẾT QUẢ HỌC TẬP & RÈN LUYỆN
-- =================================================================================
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
('SV001', 1, '2023-2024', 3.8, 8.8, 0, 18, 1), ('SV002', 1, '2023-2024', 3.6, 8.2, 0, 18, 1), 
('SV003', 1, '2023-2024', 2.5, 6.0, 1, 15, 1), ('SV004', 1, '2023-2024', 3.9, 9.2, 0, 20, 1),
('SV005', 1, '2023-2024', 3.2, 7.5, 0, 18, 1), ('SV006', 1, '2023-2024', 2.8, 6.5, 0, 15, 1),
('SV007', 1, '2023-2024', 3.7, 8.5, 0, 18, 1), ('SV008', 1, '2023-2024', 4.0, 9.5, 0, 20, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('SV001', 1, '2023-2024', 95, 2), ('SV002', 1, '2023-2024', 90, 2), ('SV003', 1, '2023-2024', 65, 2), 
('SV004', 1, '2023-2024', 98, 2), ('SV005', 1, '2023-2024', 80, 2), ('SV006', 1, '2023-2024', 70, 2),
('SV007', 1, '2023-2024', 85, 2), ('SV008', 1, '2023-2024', 100, 2);

-- SV009 - SV016 (HK2 23-24)
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
('SV009', 2, '2023-2024', 3.9, 9.1, 0, 20, 1), ('SV010', 2, '2023-2024', 3.2, 7.5, 0, 18, 1), 
('SV011', 2, '2023-2024', 3.7, 8.5, 0, 18, 1), ('SV012', 2, '2023-2024', 2.9, 6.8, 0, 15, 1),
('SV013', 2, '2023-2024', 3.5, 8.0, 0, 18, 1), ('SV014', 2, '2023-2024', 3.1, 7.2, 0, 16, 1),
('SV015', 2, '2023-2024', 3.8, 8.9, 0, 18, 1), ('SV016', 2, '2023-2024', 2.4, 5.8, 1, 14, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('SV009', 2, '2023-2024', 98, 2), ('SV010', 2, '2023-2024', 80, 2), ('SV011', 2, '2023-2024', 85, 2), 
('SV012', 2, '2023-2024', 75, 2), ('SV013', 2, '2023-2024', 88, 2), ('SV014', 2, '2023-2024', 78, 2),
('SV015', 2, '2023-2024', 92, 2), ('SV016', 2, '2023-2024', 60, 2);

-- =================================================================================
-- 5. ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ
-- =================================================================================
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Đợt 1 - Đã xong', 1, '2023-2024', 'ChinhThuc'),
(N'Đợt 2 - Đang xét duyệt', 2, '2023-2024', 'DangXetDuyet'),
(N'Đợt 3 - CTSV rà soát', 1, '2024-2025', 'DangXetDuyet'),
(N'Đợt 4 - Hiệu trưởng phê duyệt', 2, '2024-2025', 'ChoPheDuyet');

INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha, MucHBLoaiGioi, MucHBLoaiXuatSac) VALUES 
(1, 1, 200000000, 5000000, 6500000, 8000000), (1, 2, 150000000, 5000000, 6500000, 8000000),
(2, 1, 200000000, 5000000, 6500000, 8000000), (2, 2, 150000000, 5000000, 6500000, 8000000);

-- =================================================================================
-- 6. HỒ SƠ XÉT HỌC BỔNG
-- =================================================================================
-- ĐỢT 1: ChinhThuc
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, DiemHocTap, GPA, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('SV001', 1, 8.8, 3.8, 95, N'Xuất sắc', 'ChinhThuc', 6),
('SV002', 1, 8.2, 3.6, 90, N'Giỏi', 'ChinhThuc', 6),
('SV004', 1, 9.2, 3.9, 98, N'Xuất sắc', 'ChinhThuc', 6),
('SV005', 1, 7.5, 3.2, 80, N'Khá', 'ChinhThuc', 6),
('SV006', 1, 6.5, 2.8, 70, N'Khá', 'ChinhThuc', 6),
('SV007', 1, 8.5, 3.7, 85, N'Giỏi', 'ChinhThuc', 6),
('SV008', 1, 9.5, 4.0, 100, N'Xuất sắc', 'ChinhThuc', 6);

-- ĐỢT 2: DangXetDuyet
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, DiemHocTap, GPA, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('SV009', 2, 9.1, 3.9, 98, NULL, 'ChoXet', NULL),
('SV010', 2, 7.5, 3.2, 80, NULL, 'ChoXet', NULL),
('SV011', 2, 8.5, 3.7, 85, N'Giỏi', 'KhoaDeXuat', 4),
('SV012', 2, 6.8, 2.9, 75, N'Khá', 'KhoaDeXuat', 4),
('SV013', 2, 8.0, 3.5, 88, N'Giỏi', 'KhoaDeXuat', 4),
('SV014', 2, 7.2, 3.1, 78, N'Khá', 'HoiDongDuyet', 5),
('SV015', 2, 8.9, 3.8, 92, N'Xuất sắc', 'HoiDongDuyet', 5);

-- =================================================================================
-- 7. KHIẾU NẠI
-- =================================================================================
INSERT INTO [KHIEUNAI] (MaHoSo, NoiDung, MinhChung, NgayGui, TrangThai) VALUES 
(1, N'Em thấy điểm rèn luyện của em bị thiếu điểm Đoàn hội.', 'link_minh_chung_1', GETDATE(), 'ChoXuLy');

-- =================================================================================
-- 8. DANH SÁCH CHI TRẢ
-- =================================================================================
INSERT INTO [DSHOCBONG] (MaDot, MaSV, XepLoai, SoTien, NgayPheDuyet, MaCB_PheDuyet) VALUES 
(1, 'SV001', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, 'SV002', N'Giỏi', 6500000, '2024-03-01', 6);

INSERT INTO [CHITRA] (MaHoSo, SoTien, NgayXacNhan, TrangThai, MaCB_GiaiNgan) VALUES 
(1, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(2, 6500000, '2024-03-15', 'DaGiaiNgan', 3);
GO

-- =================================================================================
-- BƠM THÊM 50 SINH VIÊN VÀO ĐỢT 2 CHỜ HỘI ĐỒNG DUYỆT (Từ SV031 đến SV080)
-- =================================================================================
DECLARE @i INT = 31;
DECLARE @MaSV VARCHAR(20);

WHILE @i <= 80
BEGIN
    SET @MaSV = 'SV' + RIGHT('000' + CAST(@i AS VARCHAR), 3);
    INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) 
    VALUES (@MaSV, '123456', 'SinhVien', 1);

    DECLARE @MaLop INT = (@i % 3) + 1; 
    INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK)
    VALUES (
        @MaSV, 
        N'Nguyễn Sinh Viên ' + CAST(@i AS NVARCHAR), 
        '2005-01-01', 
        LOWER(@MaSV) + '@ute.edu.vn', 
        '0901000' + RIGHT('000' + CAST(@i AS VARCHAR), 3), 
        @MaLop, 
        IDENT_CURRENT('TAIKHOAN')
    );

    DECLARE @RandomGPA REAL = ROUND(3.2 + (RAND() * 0.8), 2);
    DECLARE @RandomDHT REAL = ROUND(7.5 + (RAND() * 2.3), 2);
    DECLARE @RandomDRL INT = 80 + CAST(RAND() * 20 AS INT);

    INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap)
    VALUES (@MaSV, 2, '2023-2024', @RandomGPA, @RandomDHT, 0, 18, 1);

    INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap)
    VALUES (@MaSV, 2, '2023-2024', @RandomDRL, 2);

    DECLARE @XepLoai NVARCHAR(50);
    IF (@RandomGPA >= 3.6 AND @RandomDRL >= 90) SET @XepLoai = N'Xuất sắc';
    ELSE IF (@RandomGPA >= 3.2 AND @RandomDRL >= 80) SET @XepLoai = N'Giỏi';
    ELSE SET @XepLoai = N'Khá';

    INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, GPA, DiemHocTap, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet)
    VALUES (@MaSV, 2, @RandomGPA, @RandomDHT, @RandomDRL, @XepLoai, 'KhoaDeXuat', 4);

    SET @i = @i + 1;
END
GO
