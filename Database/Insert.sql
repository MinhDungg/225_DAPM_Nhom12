USE dbQLHocBong;
GO

-- =================================================================================
-- 1. THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================
-- Xem 10 dòng điểm học vụ mới nhất được nạp vào
SELECT TOP 10 * FROM KETQUAHOCTAP ORDER BY MaDiem DESC;

-- Xem 10 dòng điểm rèn luyện mới nhất được nạp vào
SELECT TOP 10 * FROM DIEMRENLUYEN ORDER BY MaDRL DESC;
go
-- Thêm Phòng ban
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'),             -- ID: 1
(N'Phòng Công tác Sinh viên'),  -- ID: 2
(N'Phòng Kế hoạch Tài chính'),  -- ID: 3
(N'Ban Giám Hiệu');             -- ID: 4

-- Thêm Khoa
INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Thông tin'),  -- ID: 1
(N'Khoa Công nghệ thực phẩm'),  -- ID: 2
(N'Khoa Điện');                 -- ID: 3

-- Thêm Lớp (Chia làm 2 lớp thuộc Khoa CNTT)
INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), -- ID: 1
('23T2', 1); -- ID: 2

-- =================================================================================
-- 2. THÊM TÀI KHOẢN & CÁN BỘ CHO 6 TÁC NHÂN
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
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaKhoa, MaTK) VALUES (N'Nguyễn Văn Khoa', 'khoacntt@ute.edu.vn', N'Trưởng Khoa', NULL, 1, IDENT_CURRENT('TAIKHOAN'));

-- 5. Tác nhân: Hội đồng
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hoidong', '123456', 'HoiDong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Hội Đồng Trường', 'hoidong@ute.edu.vn', N'Chủ tịch Hội đồng', 4, IDENT_CURRENT('TAIKHOAN'));

-- 6. Tác nhân: Hiệu trưởng
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES ('hieutruong', '123456', 'HieuTruong', 1);
INSERT INTO [CANBO] (HoTen, Email, ChucVu, MaPhong, MaTK) VALUES (N'Nguyễn Hiệu Trưởng', 'hieutruong@ute.edu.vn', N'Hiệu trưởng', 4, IDENT_CURRENT('TAIKHOAN'));

-- =================================================================================
-- 3. THÊM TÀI KHOẢN & SINH VIÊN (10 BẢN GHI)
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

-- =================================================================================
-- 4. NẠP ĐIỂM HỌC TẬP VÀ RÈN LUYỆN
-- Cấu trúc mới: Thêm DiemHocTap (hệ 10) và CoDiemF
-- =================================================================================

INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 3.8, 9.2, 0, 18, 1), 
('23115053122102', 1, '2023-2024', 3.6, 8.8, 0, 18, 1),
('23115053122103', 1, '2023-2024', 2.5, 6.5, 1, 15, 1), -- SV 03 bị F
('23115053122104', 1, '2023-2024', 3.9, 9.5, 0, 20, 1),
('23115053122105', 1, '2023-2024', 3.2, 8.0, 0, 18, 1), 
('23115053122106', 1, '2023-2024', 3.7, 9.0, 0, 18, 1),
('23115053122107', 1, '2023-2024', 3.5, 8.5, 0, 18, 1), 
('23115053122108', 1, '2023-2024', 3.1, 7.8, 0, 15, 1),
('23115053122109', 1, '2023-2024', 3.8, 9.2, 0, 20, 1), 
('23115053122110', 1, '2023-2024', 2.8, 7.0, 0, 15, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 95, 2), ('23115053122102', 1, '2023-2024', 90, 2),
('23115053122103', 1, '2023-2024', 65, 2), ('23115053122104', 1, '2023-2024', 98, 2),
('23115053122105', 1, '2023-2024', 80, 2), ('23115053122106', 1, '2023-2024', 85, 2),
('23115053122107', 1, '2023-2024', 88, 2), ('23115053122108', 1, '2023-2024', 75, 2),
('23115053122109', 1, '2023-2024', 92, 2), ('23115053122110', 1, '2023-2024', 70, 2);

-- =================================================================================
-- 5. ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ
-- =================================================================================

INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Khuyến khích học tập HK1', 1, '2023-2024', 'ChinhThuc'),
(N'Khuyến khích học tập HK2', 2, '2023-2024', 'DangXetDuyet');

INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha) VALUES 
(1, 1, 200000000, 5000000), (1, 2, 150000000, 5000000), (1, 3, 100000000, 4500000),
(2, 1, 250000000, 5500000), (2, 2, 150000000, 5000000);

-- =================================================================================
-- 6. HỒ SƠ XÉT HỌC BỔNG (Sau khi đã tự động quét)
-- Cấu trúc mới: Phải có GPA, DiemHocTap, DiemRenLuyen, GhiChu
-- =================================================================================

INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, GPA, DiemHocTap, DiemRenLuyen, XepLoaiHB, TrangThai, GhiChu, MaCB_Duyet) VALUES 
('23115053122101', 1, '2024-02-10', 3.8, 9.2, 95, N'Xuất sắc', 'HoiDongDuyet', NULL, 4),
('23115053122102', 1, '2024-02-11', 3.6, 8.8, 90, N'Giỏi', 'HoiDongDuyet', NULL, 4),
('23115053122104', 1, '2024-02-12', 3.9, 9.5, 98, N'Xuất sắc', 'HoiDongDuyet', NULL, 4),
('23115053122106', 1, '2024-02-12', 3.7, 9.0, 85, N'Giỏi', 'HoiDongDuyet', NULL, 4),
('23115053122109', 1, '2024-02-13', 3.8, 9.2, 92, N'Xuất sắc', 'HoiDongDuyet', NULL, 4),
('23115053122107', 1, '2024-02-14', 3.5, 8.5, 88, N'Giỏi', 'HoiDongDuyet', NULL, 4),
('23115053122105', 1, '2024-02-14', 3.2, 8.0, 80, N'Khá', 'HoiDongDuyet', NULL, 4),
('23115053122103', 1, '2024-02-15', 2.5, 6.5, 65, NULL, 'TuChoi', N'Bị điểm F', 4),
('23115053122108', 1, '2024-02-16', 3.1, 7.8, 75, NULL, 'TuChoi', N'Không đủ chỉ tiêu', 4),
('23115053122110', 1, '2024-02-16', 2.8, 7.0, 70, NULL, 'ChoXet', NULL, NULL);

-- =================================================================================
-- 7. KHIẾU NẠI, DANH SÁCH & CHI TRẢ (LUỒNG SAU XÉT DUYỆT)
-- =================================================================================

INSERT INTO [KHIEUNAI] (MaHoSo, NoiDung, MinhChung, NgayGui, TrangThai, MaCB_Duyet) VALUES 
(8, N'Lỗi hệ thống ghi nhận thiếu điểm rèn luyện', 'link_driver_1', '2024-02-20', 'DaXuLy', 2),
(9, N'Chưa cộng điểm ban cán sự lớp', 'link_driver_2', '2024-02-21', 'DaXuLy', 4),
(10, N'Lỗi cập nhật tín chỉ học tập', 'link_driver_3', '2024-02-22', 'ChoXuLy', NULL);

INSERT INTO [DSHOCBONG] (MaDot, MaSV, XepLoai, SoTien, NgayPheDuyet, MaCB_PheDuyet) VALUES 
(1, '23115053122101', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122102', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122104', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122106', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122109', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122107', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122105', N'Khá', 5000000, '2024-03-01', 6);

INSERT INTO [CHITRA] (MaHoSo, SoTien, NgayXacNhan, TrangThai, MaCB_GiaiNgan) VALUES 
(1, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(2, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(3, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(4, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(5, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(6, 6500000, NULL, 'ChuaGiaiNgan', NULL),
(7, 5000000, NULL, 'ChuaGiaiNgan', NULL);

-- =================================================================================
-- 8. KỊCH BẢN TEST CHO ĐỢT MỚI (TẠO MẪU BẰNG TAY)
-- =================================================================================

-- INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) 
-- VALUES (N'Học bổng khuyến khích học tập HK3', 3, '2023-2024', 'KhoiTao');
-- GO

-- DECLARE @MaDot int = SCOPE_IDENTITY();

-- -- Thêm điểm rèn luyện HK3
-- INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap)
-- VALUES 
-- ('23115053122101', 3, '2023-2024', 85, 2), 
-- ('23115053122102', 3, '2023-2024', 90, 2),
-- ('23115053122103', 3, '2023-2024', 80, 2),
-- ('23115053122104', 3, '2023-2024', 88, 2),
-- ('23115053122105', 3, '2023-2024', 92, 2);

-- -- Thêm kết quả học tập HK3
-- INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap)
-- VALUES 
-- ('23115053122101', 3, '2023-2024', 3.5, 8.5, 0, 20, 1), 
-- ('23115053122102', 3, '2023-2024', 3.8, 9.2, 0, 20, 1),
-- ('23115053122103', 3, '2023-2024', 3.2, 8.0, 0, 20, 1),
-- ('23115053122104', 3, '2023-2024', 3.6, 8.8, 0, 20, 1),
-- ('23115053122105', 3, '2023-2024', 3.9, 9.5, 0, 20, 1);

-- -- Thêm hồ sơ chờ xét mẫu (Giả lập thao tác CTSV bấm quét ứng viên)
-- INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, GPA, DiemHocTap, DiemRenLuyen, XepLoaiHB, TrangThai, GhiChu, MaCB_Duyet)
-- VALUES 
-- ('23115053122101', @MaDot, GETDATE(), 3.5, 8.5, 85, NULL, 'ChoXet', NULL, NULL),
-- ('23115053122102', @MaDot, GETDATE(), 3.8, 9.2, 90, NULL, 'ChoXet', NULL, NULL),
-- ('23115053122103', @MaDot, GETDATE(), 3.2, 8.0, 80, NULL, 'ChoXet', NULL, NULL),
-- ('23115053122104', @MaDot, GETDATE(), 3.6, 8.8, 88, NULL, 'ChoXet', NULL, NULL),
-- ('23115053122105', @MaDot, GETDATE(), 3.9, 9.5, 92, NULL, 'ChoXet', NULL, NULL);
-- GO