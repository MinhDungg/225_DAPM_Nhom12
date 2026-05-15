USE dbQLHocBong;
GO

-- =================================================================================
-- 0. VÁ LỖI CONSTRAINT & XÓA SẠCH DỮ LIỆU CŨ (RESET TỪ ĐẦU)
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

-- DBCC CHECKIDENT ('[CHITRA]', RESEED, 0);
-- DBCC CHECKIDENT ('[DSHOCBONG]', RESEED, 0);
-- DBCC CHECKIDENT ('[KHIEUNAI]', RESEED, 0);
-- DBCC CHECKIDENT ('[HOSOXETHOCBONG]', RESEED, 0);
-- DBCC CHECKIDENT ('[PHANBOKINHPHI]', RESEED, 0);
-- DBCC CHECKIDENT ('[DOTHOCBONG]', RESEED, 0);
-- DBCC CHECKIDENT ('[DIEMRENLUYEN]', RESEED, 0);
-- DBCC CHECKIDENT ('[KETQUAHOCTAP]', RESEED, 0);
-- DBCC CHECKIDENT ('[LOP]', RESEED, 0);
-- DBCC CHECKIDENT ('[CANBO]', RESEED, 0);
-- DBCC CHECKIDENT ('[KHOA]', RESEED, 0);
-- DBCC CHECKIDENT ('[PHONGBAN]', RESEED, 0);
-- DBCC CHECKIDENT ('[TAIKHOAN]', RESEED, 0);
GO

-- =================================================================================
-- 1. THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'), (N'Phòng Công tác Sinh viên'), (N'Phòng Kế hoạch Tài chính'), (N'Ban Giám Hiệu');

INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Số'), (N'Khoa Điện - Điện tử');

-- Tạo 3 lớp đại diện cho 3 khóa của Khoa CNS (MaKhoa = 1)
INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), ('24T1', 1), ('25T1', 1);

-- =================================================================================
-- 2. THÊM TÀI KHOẢN & CÁN BỘ (6 ROLE CHÍNH)
-- =================================================================================
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('daotao', '123', 'DaoTao', 1),
('ctsv', '123', 'CTSV', 1),
('khtc', '123', 'KHTC', 1),
('khoacns', '123', 'Khoa', 1),
('hoidong', '123', 'HoiDong', 1),
('hieutruong', '123', 'HieuTruong', 1);

INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaKhoa, MaTK) VALUES 
(N'Phạm Thị Đào Tạo', 'daotao@ute.edu.vn', N'Chuyên viên', 1, NULL, 1),
(N'Trần Thị CTSV', 'ctsv@ute.edu.vn', N'Chuyên viên', 2, NULL, 2),
(N'Lê Văn KHTC', 'khtc@ute.edu.vn', N'Chuyên viên', 3, NULL, 3),
(N'Nguyễn Trưởng Khoa', 'khoacns@ute.edu.vn', N'Trưởng Khoa CNS', NULL, 1, 4),
(N'Đại Diện Hội Đồng', 'hoidong@ute.edu.vn', N'Chủ tịch', 4, NULL, 5),
(N'Thầy Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, NULL, 6);

-- =================================================================================
-- 3. TẠO 12 TÀI KHOẢN & SINH VIÊN (CHIA ĐỀU 3 KHÓA)
-- =================================================================================
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('SV001', '123', 'SinhVien', 1), ('SV002', '123', 'SinhVien', 1), ('SV003', '123', 'SinhVien', 1), ('SV004', '123', 'SinhVien', 1),
('SV005', '123', 'SinhVien', 1), ('SV006', '123', 'SinhVien', 1), ('SV007', '123', 'SinhVien', 1), ('SV008', '123', 'SinhVien', 1),
('SV009', '123', 'SinhVien', 1), ('SV010', '123', 'SinhVien', 1), ('SV011', '123', 'SinhVien', 1), ('SV012', '123', 'SinhVien', 1);

-- Nhóm Khóa 23 (Thuộc lớp 23T1 - MaLop = 1)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV001', N'Khóa Hai Ba - Xuất Sắc', '2005-01-01', 'sv001@ute.edu.vn', '0901000001', 1, 7),
('SV002', N'Khóa Hai Ba - Giỏi',     '2005-02-02', 'sv002@ute.edu.vn', '0901000002', 1, 8),
('SV003', N'Khóa Hai Ba - Khá',      '2005-03-03', 'sv003@ute.edu.vn', '0901000003', 1, 9),
('SV004', N'Khóa Hai Ba - Dính F',   '2005-04-04', 'sv004@ute.edu.vn', '0901000004', 1, 10);

-- Nhóm Khóa 24 (Thuộc lớp 24T1 - MaLop = 2)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV005', N'Khóa Hai Tư - Xuất Sắc', '2006-01-01', 'sv005@ute.edu.vn', '0901000005', 2, 11),
('SV006', N'Khóa Hai Tư - Giỏi',     '2006-02-02', 'sv006@ute.edu.vn', '0901000006', 2, 12),
('SV007', N'Khóa Hai Tư - Khá',      '2006-03-03', 'sv007@ute.edu.vn', '0901000007', 2, 13),
('SV008', N'Khóa Hai Tư - Thiếu TC', '2006-04-04', 'sv008@ute.edu.vn', '0901000008', 2, 14);

-- Nhóm Khóa 25 (Thuộc lớp 25T1 - MaLop = 3)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV009', N'Khóa Hai Lăm - Xuất Sắc','2007-01-01', 'sv009@ute.edu.vn', '0901000009', 3, 15),
('SV010', N'Khóa Hai Lăm - Giỏi',    '2007-02-02', 'sv010@ute.edu.vn', '0901000010', 3, 16),
('SV011', N'Khóa Hai Lăm - Khá',     '2007-03-03', 'sv011@ute.edu.vn', '0901000011', 3, 17),
('SV012', N'Khóa Hai Lăm - Dính F',  '2007-04-04', 'sv012@ute.edu.vn', '0901000012', 3, 18);

-- =================================================================================
-- 4. KỊCH BẢN ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ (TẠO TRƯỚC ĐỂ KHÔNG LỖI KHÓA NGOẠI)
-- =================================================================================
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Học bổng KKHT - Học kỳ 1', 1, '2025-2026', 'DangXetDuyet'), -- Đợt 1: Dành cho Khoa test
(N'Học bổng KKHT - Học kỳ 2', 2, '2025-2026', 'KhoiTao');      -- Đợt 2: Dành cho Đào tạo test

-- KHTC rót tiền cho Đợt 1 (Mã Khoa CNS = 1)
INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha) VALUES 
(1, 1, 50000000, 5000000); -- Khoa CNS được cấp 50 triệu, mức sàn 5 triệu.

-- =================================================================================
-- 5. BƠM ĐIỂM HỌC VỤ & RÈN LUYỆN (MAP CHÍNH XÁC VỚI HỒ SƠ)
-- =================================================================================
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
-- Khóa 23
('SV001', 1, '2025-2026', 3.9, 9.5, 0, 18, 1), 
('SV002', 1, '2025-2026', 3.5, 8.5, 0, 18, 1), 
('SV003', 1, '2025-2026', 2.8, 7.5, 0, 18, 1), 
('SV004', 1, '2025-2026', 3.2, 7.8, 1, 18, 1), -- CoDiemF = 1 (Rớt)

-- Khóa 24
('SV005', 1, '2025-2026', 3.8, 9.2, 0, 18, 1), 
('SV006', 1, '2025-2026', 3.6, 8.6, 0, 18, 1), 
('SV007', 1, '2025-2026', 2.9, 7.2, 0, 18, 1), 
('SV008', 1, '2025-2026', 3.5, 8.5, 0, 10, 1), -- SoTC = 10 (Thiếu TC)

-- Khóa 25
('SV009', 1, '2025-2026', 4.0, 9.8, 0, 18, 1), 
('SV010', 1, '2025-2026', 3.7, 8.8, 0, 18, 1), 
('SV011', 1, '2025-2026', 3.1, 7.5, 0, 18, 1), 
('SV012', 1, '2025-2026', 2.7, 6.5, 1, 18, 1); -- CoDiemF = 1 (Rớt)

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('SV001', 1, '2025-2026', 95, 2), ('SV002', 1, '2025-2026', 85, 2), ('SV003', 1, '2025-2026', 75, 2), ('SV004', 1, '2025-2026', 78, 2),
('SV005', 1, '2025-2026', 92, 2), ('SV006', 1, '2025-2026', 88, 2), ('SV007', 1, '2025-2026', 72, 2), ('SV008', 1, '2025-2026', 85, 2),
('SV009', 1, '2025-2026', 98, 2), ('SV010', 1, '2025-2026', 89, 2), ('SV011', 1, '2025-2026', 80, 2), ('SV012', 1, '2025-2026', 70, 2);

-- =================================================================================
-- 6. HỒ SƠ CHỜ XÉT DUYỆT (MÔ PHỎNG CTSV ĐÃ QUÉT XONG - SINGLE SOURCE OF TRUTH)
-- =================================================================================
-- 9 Bạn đủ điều kiện -> 'ChoXet'
-- 3 Bạn dính F / Thiếu TC -> 'Loai'
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, DiemHocTap, GPA, DiemRenLuyen, TrangThai, GhiChu) VALUES 
-- Khóa 23
('SV001', 1, 9.5, 3.9, 95, 'ChoXet', NULL),
('SV002', 1, 8.5, 3.5, 85, 'ChoXet', NULL),
('SV003', 1, 7.5, 2.8, 75, 'ChoXet', NULL),
('SV004', 1, 7.8, 3.2, 78, 'Loai', N'Có điểm F trong học kỳ'),

-- Khóa 24
('SV005', 1, 9.2, 3.8, 92, 'ChoXet', NULL),
('SV006', 1, 8.6, 3.6, 88, 'ChoXet', NULL),
('SV007', 1, 7.2, 2.9, 72, 'ChoXet', NULL),
('SV008', 1, 8.5, 3.5, 85, 'Loai', N'Không đủ 15 tín chỉ'),

-- Khóa 25
('SV009', 1, 9.8, 4.0, 98, 'ChoXet', NULL),
('SV010', 1, 8.8, 3.7, 89, 'ChoXet', NULL),
('SV011', 1, 7.5, 3.1, 80, 'ChoXet', NULL),
('SV012', 1, 6.5, 2.7, 70, 'Loai', N'Có điểm F trong học kỳ');
GO


-- =================================================================================
-- BỔ SUNG: THÊM 9 TÀI KHOẢN & SINH VIÊN ĐỂ LÀM LỆCH TỶ LỆ QUÂN SỐ
-- (Khóa 23: 4 SV | Khóa 24: 7 SV | Khóa 25: 10 SV)
-- =================================================================================

-- Thêm 9 tài khoản mới (SV013 - SV021)
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('SV013', '123', 'SinhVien', 1), ('SV014', '123', 'SinhVien', 1), ('SV015', '123', 'SinhVien', 1),
('SV016', '123', 'SinhVien', 1), ('SV017', '123', 'SinhVien', 1), ('SV018', '123', 'SinhVien', 1),
('SV019', '123', 'SinhVien', 1), ('SV020', '123', 'SinhVien', 1), ('SV021', '123', 'SinhVien', 1);

-- Thêm 3 sinh viên cho Khóa 24 (Lớp 24T1 - MaLop = 2)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV013', N'Khóa Hai Tư - Lệch 1', '2006-05-05', 'sv013@ute.edu.vn', '0901000013', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV013')),
('SV014', N'Khóa Hai Tư - Lệch 2', '2006-06-06', 'sv014@ute.edu.vn', '0901000014', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV014')),
('SV015', N'Khóa Hai Tư - Lệch 3', '2006-07-07', 'sv015@ute.edu.vn', '0901000015', 2, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV015'));

-- Thêm 6 sinh viên cho Khóa 25 (Lớp 25T1 - MaLop = 3)
INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV016', N'Khóa Hai Lăm - Lệch 1', '2007-05-05', 'sv016@ute.edu.vn', '0901000016', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV016')),
('SV017', N'Khóa Hai Lăm - Lệch 2', '2007-06-06', 'sv017@ute.edu.vn', '0901000017', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV017')),
('SV018', N'Khóa Hai Lăm - Lệch 3', '2007-07-07', 'sv018@ute.edu.vn', '0901000018', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV018')),
('SV019', N'Khóa Hai Lăm - Lệch 4', '2007-08-08', 'sv019@ute.edu.vn', '0901000019', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV019')),
('SV020', N'Khóa Hai Lăm - Lệch 5', '2007-09-09', 'sv020@ute.edu.vn', '0901000020', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV020')),
('SV021', N'Khóa Hai Lăm - Lệch 6', '2007-10-10', 'sv021@ute.edu.vn', '0901000021', 3, (SELECT MaTK FROM TAIKHOAN WHERE TenDangNhap = 'SV021'));