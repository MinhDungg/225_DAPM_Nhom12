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

INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('25T1', 1), ('25T2', 1), ('25D1', 2);

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
-- 3. THÊM 10 SINH VIÊN (DÙNG ĐỂ TEST CÁC TRƯỜNG HỢP NGHIỆP VỤ)
-- =================================================================================
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('SV001', '123', 'SinhVien', 1), ('SV002', '123', 'SinhVien', 1),
('SV003', '123', 'SinhVien', 1), ('SV004', '123', 'SinhVien', 1),
('SV005', '123', 'SinhVien', 1), ('SV006', '123', 'SinhVien', 1),
('SV007', '123', 'SinhVien', 1), ('SV008', '123', 'SinhVien', 1),
('SV009', '123', 'SinhVien', 1), ('SV010', '123', 'SinhVien', 1);

INSERT INTO [SINHVIEN] (MaSV, HoTen, NgaySinh, Email, SDT, MaLop, MaTK) VALUES 
('SV001', N'Trần Văn Xuất Sắc', '2005-01-01', 'sv001@ute.edu.vn', '0901000001', 1, 7),
('SV002', N'Lê Thị Giỏi',       '2005-02-02', 'sv002@ute.edu.vn', '0901000002', 1, 8),
('SV003', N'Nguyễn Văn Khá',    '2005-03-03', 'sv003@ute.edu.vn', '0901000003', 1, 9),
('SV004', N'Phạm Rớt Môn F',    '2005-04-04', 'sv004@ute.edu.vn', '0901000004', 1, 10),
('SV005', N'Hoàng Thiếu Tín',   '2005-05-05', 'sv005@ute.edu.vn', '0901000005', 2, 11),
('SV006', N'Đinh Văn Khá Hai',  '2005-06-06', 'sv006@ute.edu.vn', '0901000006', 2, 12),
('SV007', N'Vũ Thị Giỏi Hai',   '2005-07-07', 'sv007@ute.edu.vn', '0901000007', 2, 13),
('SV008', N'Lý Xuất Sắc Hai',   '2005-08-08', 'sv008@ute.edu.vn', '0901000008', 2, 14),
('SV009', N'Bùi Điện Tử Khá',   '2005-09-09', 'sv009@ute.edu.vn', '0901000009', 3, 15),
('SV010', N'Hồ Điện Tử Giỏi',   '2005-10-10', 'sv010@ute.edu.vn', '0901000010', 3, 16);

-- =================================================================================
-- 4. KẾT QUẢ HỌC TẬP & RÈN LUYỆN (TEST DATA CHO ĐỢT ĐANG XÉT DUYỆT)
-- =================================================================================
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
('SV001', 1, '2025-2026', 3.8, 8.8, 0, 18, 1), -- Đạt Xuất sắc
('SV002', 1, '2025-2026', 3.4, 8.2, 0, 18, 1), -- Đạt Giỏi
('SV003', 1, '2025-2026', 2.8, 6.8, 0, 15, 1), -- Đạt Khá
('SV004', 1, '2025-2026', 3.9, 9.2, 1, 20, 1), -- Dính điểm F -> Loại
('SV005', 1, '2025-2026', 3.7, 8.5, 0, 10, 1), -- Dưới 15 TC -> Loại
('SV006', 1, '2025-2026', 2.6, 6.5, 0, 15, 1), -- Đạt Khá
('SV007', 1, '2025-2026', 3.5, 8.3, 0, 18, 1), -- Đạt Giỏi
('SV008', 1, '2025-2026', 3.9, 9.5, 0, 20, 1), -- Đạt Xuất sắc
('SV009', 1, '2025-2026', 2.9, 7.0, 0, 16, 1), -- Khoa điện (Khá)
('SV010', 1, '2025-2026', 3.3, 8.0, 0, 18, 1); -- Khoa điện (Giỏi)

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('SV001', 1, '2025-2026', 95, 2), ('SV002', 1, '2025-2026', 85, 2), 
('SV003', 1, '2025-2026', 75, 2), ('SV004', 1, '2025-2026', 98, 2), 
('SV005', 1, '2025-2026', 80, 2), ('SV006', 1, '2025-2026', 72, 2),
('SV007', 1, '2025-2026', 82, 2), ('SV008', 1, '2025-2026', 92, 2),
('SV009', 1, '2025-2026', 78, 2), ('SV010', 1, '2025-2026', 88, 2);

-- =================================================================================
-- 5. KỊCH BẢN ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ
-- =================================================================================
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Học bổng KKHT - Học kỳ 1', 1, '2025-2026', 'DangXetDuyet'), -- Đợt 1: Test Khoa Xếp hạng
(N'Học bổng KKHT - Học kỳ 2', 2, '2025-2026', 'KhoiTao');      -- Đợt 2: Test Đào tạo & KHTC Import

-- KHTC rót tiền cho Đợt 1. (Lưu ý: Bảng PHANBOKINHPHI chỉ cần MucHBLoaiKha, không cần Giỏi/XS)
INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha) VALUES 
(1, 1, 50000000, 5000000), -- Khoa CNS: 50 củ
(1, 2, 30000000, 5000000); -- Khoa Điện: 30 củ

-- =================================================================================
-- 6. HỒ SƠ XÉT HỌC BỔNG (KẾT QUẢ GIẢ LẬP SAU KHI CTSV ĐÃ "TỰ ĐỘNG QUÉT")
-- =================================================================================
-- Đã loại SV004 (F) và SV005 (Thiếu TC), còn lại là "ChoXet" cho Khoa làm việc
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, DiemHocTap, GPA, DiemRenLuyen, TrangThai, GhiChu) VALUES 
('SV001', 1, 8.8, 3.8, 95, 'ChoXet', NULL),
('SV002', 1, 8.2, 3.4, 85, 'ChoXet', NULL),
('SV003', 1, 6.8, 2.8, 75, 'ChoXet', NULL),
('SV004', 1, 9.2, 3.9, 98, 'Loai', N'Có điểm F trong học kỳ'), 
('SV005', 1, 8.5, 3.7, 80, 'Loai', N'Không đủ 15 tín chỉ'),    
('SV006', 1, 6.5, 2.6, 72, 'ChoXet', NULL),
('SV007', 1, 8.3, 3.5, 82, 'ChoXet', NULL),
('SV008', 1, 9.5, 3.9, 92, 'ChoXet', NULL),
('SV009', 1, 7.0, 2.9, 78, 'ChoXet', NULL),
('SV010', 1, 8.0, 3.3, 88, 'ChoXet', NULL);
GO