USE dbQLHocBong;
GO

-- ================================================
-- KIỂM TRA DỮ LIỆU HIỆN TẠI
-- ================================================
SELECT 'DOTHOCBONG' AS Bang, COUNT(*) AS SoLuong FROM DOTHOCBONG
UNION ALL
SELECT 'HOSOXETHOCBONG', COUNT(*) FROM HOSOXETHOCBONG
UNION ALL
SELECT 'SINHVIEN', COUNT(*) FROM SINHVIEN
UNION ALL
SELECT 'LOP', COUNT(*) FROM LOP;
GO

-- ================================================
-- BƯỚC 1: Đảm bảo Đợt học bổng MaDot = 1 tồn tại
-- ================================================
IF NOT EXISTS (SELECT 1 FROM DOTHOCBONG WHERE MaDot = 1)
BEGIN
    -- Reset identity nếu bảng rỗng
    SET IDENTITY_INSERT DOTHOCBONG ON;
    INSERT INTO DOTHOCBONG (MaDot, LoaiDot, HocKy, NamHoc, TrangThai)
    VALUES (1, N'Học bổng khuyến khích học tập', 1, '2023-2024', 'DangXetDuyet');
    SET IDENTITY_INSERT DOTHOCBONG OFF;
    PRINT 'Đã thêm DOTHOCBONG MaDot = 1';
END
ELSE
BEGIN
    PRINT 'DOTHOCBONG MaDot = 1 đã tồn tại';
END
GO

-- ================================================
-- BƯỚC 2: Đảm bảo Khoa, Lớp, Sinh viên tồn tại
-- ================================================

-- Khoa CNTT (MaKhoa = 1)
IF NOT EXISTS (SELECT 1 FROM KHOA WHERE MaKhoa = 1)
BEGIN
    SET IDENTITY_INSERT KHOA ON;
    INSERT INTO KHOA (MaKhoa, TenKhoa) VALUES (1, N'Khoa Công nghệ Thông tin');
    SET IDENTITY_INSERT KHOA OFF;
    PRINT 'Đã thêm KHOA';
END
GO

-- Lớp 23T1 (MaLop = 1, MaKhoa = 1)
IF NOT EXISTS (SELECT 1 FROM LOP WHERE MaLop = 1)
BEGIN
    SET IDENTITY_INSERT LOP ON;
    INSERT INTO LOP (MaLop, TenLop, MaKhoa) VALUES (1, '23T1', 1);
    SET IDENTITY_INSERT LOP OFF;
    PRINT 'Đã thêm LOP 23T1';
END
GO

-- Lớp 23T2 (MaLop = 2, MaKhoa = 1)
IF NOT EXISTS (SELECT 1 FROM LOP WHERE MaLop = 2)
BEGIN
    SET IDENTITY_INSERT LOP ON;
    INSERT INTO LOP (MaLop, TenLop, MaKhoa) VALUES (2, '23T2', 1);
    SET IDENTITY_INSERT LOP OFF;
    PRINT 'Đã thêm LOP 23T2';
END
GO

-- ================================================
-- BƯỚC 3: Thêm TÀI KHOẢN cho sinh viên (nếu chưa có)
-- ================================================
IF NOT EXISTS (SELECT 1 FROM TAIKHOAN WHERE TenDangNhap = '23115053122101')
BEGIN
    INSERT INTO TAIKHOAN (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
    ('23115053122101', '123456', 'SinhVien', 1),
    ('23115053122102', '123456', 'SinhVien', 1),
    ('23115053122103', '123456', 'SinhVien', 1),
    ('23115053122104', '123456', 'SinhVien', 1),
    ('23115053122105', '123456', 'SinhVien', 1);
    PRINT 'Đã thêm 5 TAIKHOAN sinh viên';
END
GO

-- ================================================
-- BƯỚC 4: Thêm SINH VIÊN (nếu chưa có)
-- ================================================
IF NOT EXISTS (SELECT 1 FROM SINHVIEN WHERE MaSV = '23115053122101')
BEGIN
    INSERT INTO SINHVIEN (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
    ('23115053122101', N'Nguyễn Sinh Viên 01', '2005-01-15', 'sv01@sv.ute.edu.vn', '0901000001', 1, 
        (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122101')),
    ('23115053122102', N'Trần Sinh Viên 02',   '2005-02-14', 'sv02@sv.ute.edu.vn', '0901000002', 1, 
        (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122102')),
    ('23115053122103', N'Lê Sinh Viên 03',     '2005-03-20', 'sv03@sv.ute.edu.vn', '0901000003', 1, 
        (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122103')),
    ('23115053122104', N'Phạm Sinh Viên 04',   '2005-04-10', 'sv04@sv.ute.edu.vn', '0901000004', 1, 
        (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122104')),
    ('23115053122105', N'Hoàng Sinh Viên 05',  '2005-05-05', 'sv05@sv.ute.edu.vn', '0901000005', 1, 
        (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = '23115053122105'));
    PRINT 'Đã thêm 5 SINHVIEN thuộc lớp 23T1 (MaKhoa=1)';
END
GO

-- ================================================
-- BƯỚC 5: Thêm HỒ SƠ XÉT HỌC BỔNG (nếu chưa có)
-- ================================================
-- IF NOT EXISTS (
--     SELECT 1 FROM HOSOXETHOCBONG 
--     WHERE MaDot = 1 AND TrangThai = 'ChoXet'
-- )
-- BEGIN
--     INSERT INTO HOSOXETHOCBONG 
--         (MaSV, MaDot, NgayNop, GPA, DiemNCKH, DiemHDCD, XepLoaiHB, TrangThai, MaCB_Duyet)
--     VALUES 
--     ('23115053122101', 1, GETDATE(), 3.5, 5, 3, NULL, 'ChoXet', NULL),
--     ('23115053122102', 1, GETDATE(), 3.8, 8, 5, NULL, 'ChoXet', NULL),
--     ('23115053122103', 1, GETDATE(), 3.2, 2, 1, NULL, 'ChoXet', NULL),
--     ('23115053122104', 1, GETDATE(), 3.6, 6, 4, NULL, 'ChoXet', NULL),
--     ('23115053122105', 1, GETDATE(), 3.9, 10, 7, NULL, 'ChoXet', NULL);
--     PRINT 'Đã thêm 5 HOSOXETHOCBONG trạng thái ChoXet';
-- END
-- GO

-- ================================================
-- KIỂM TRA KẾT QUẢ QUERY MỤC TIÊU
-- ================================================
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