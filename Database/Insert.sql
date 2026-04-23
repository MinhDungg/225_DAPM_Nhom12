USE dbQLHocBong;
GO

-- =================================================================================
-- 1. THÊM DỮ LIỆU DANH MỤC (PHÒNG BAN, KHOA, LỚP)
-- =================================================================================
INSERT INTO [PHONGBAN] (TenPhong) VALUES 
(N'Phòng Đào tạo'), (N'Phòng Công tác Sinh viên'), (N'Phòng Kế hoạch Tài chính'), (N'Ban Giám Hiệu');

INSERT INTO [KHOA] (TenKhoa) VALUES 
(N'Khoa Công nghệ Thông tin'), (N'Khoa Công nghệ thực phẩm'), (N'Khoa Điện');

INSERT INTO [LOP] (TenLop, MaKhoa) VALUES 
('23T1', 1), ('23T2', 1);

-- =================================================================================
-- 2. THÊM TÀI KHOẢN & CÁN BỘ CHO 6 TÁC NHÂN
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
-- 3. THÊM TÀI KHOẢN & SINH VIÊN
-- =================================================================================
INSERT INTO [TAIKHOAN] (TenDangNhap, MatKhau, VaiTro, TrangThai) VALUES 
('23115053122101', '123456', 'SinhVien', 1), ('23115053122102', '123456', 'SinhVien', 1),
('23115053122103', '123456', 'SinhVien', 1), ('23115053122104', '123456', 'SinhVien', 1),
('23115053122105', '123456', 'SinhVien', 1), ('23115053122106', '123456', 'SinhVien', 1),
('23115053122107', '123456', 'SinhVien', 1), ('23115053122108', '123456', 'SinhVien', 1),
('23115053122109', '123456', 'SinhVien', 1), ('23115053122110', '123456', 'SinhVien', 1);

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
-- 4. KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN (Cập nhật đủ các cột V3)
-- =================================================================================
INSERT INTO [KETQUAHOCTAP] (MaSV, HocKy, NamHoc, GPA, DiemHocTap, CoDiemF, SoTC, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 3.8, 3.8, 0, 18, 1), ('23115053122102', 1, '2023-2024', 3.6, 3.6, 0, 18, 1),
('23115053122103', 1, '2023-2024', 2.5, 2.5, 1, 15, 1), ('23115053122104', 2, '2023-2024', 3.9, 3.9, 0, 20, 1),
('23115053122105', 1, '2023-2024', 3.2, 3.2, 0, 18, 1), ('23115053122106', 2, '2023-2024', 3.7, 3.7, 0, 18, 1),
('23115053122107', 2, '2023-2024', 3.5, 3.5, 0, 18, 1), ('23115053122108', 2, '2023-2024', 3.1, 3.1, 0, 15, 1),
('23115053122109', 2, '2023-2024', 3.8, 3.8, 0, 20, 1), ('23115053122110', 2, '2023-2024', 2.8, 2.8, 0, 15, 1);

INSERT INTO [DIEMRENLUYEN] (MaSV, HocKy, NamHoc, DiemSo, MaCB_Nhap) VALUES 
('23115053122101', 1, '2023-2024', 95, 2), ('23115053122102', 1, '2023-2024', 90, 2),
('23115053122103', 1, '2023-2024', 65, 2), ('23115053122104', 2, '2023-2024', 98, 2),
('23115053122105', 1, '2023-2024', 80, 2), ('23115053122106', 2, '2023-2024', 85, 2),
('23115053122107', 2, '2023-2024', 88, 2), ('23115053122108', 2, '2023-2024', 75, 2),
('23115053122109', 2, '2023-2024', 92, 2), ('23115053122110', 2, '2023-2024', 70, 2);

-- =================================================================================
-- 5. ĐỢT HỌC BỔNG VÀ PHÂN BỔ KINH PHÍ (Cập nhật đủ các mức tiền)
-- =================================================================================
INSERT INTO [DOTHOCBONG] (LoaiDot, HocKy, NamHoc, TrangThai) VALUES 
(N'Khuyến khích học tập HK1', 1, '2023-2024', 'ChinhThuc'),     -- ĐỢT 1: Lịch sử, đã chốt xong
(N'Khuyến khích học tập HK2', 2, '2023-2024', 'DangXetDuyet');  -- ĐỢT 2: Test luồng CTSV -> Hiệu trưởng

INSERT INTO [PHANBOKINHPHI] (MaDot, MaKhoa, KinhPhi, MucHBLoaiKha, MucHBLoaiGioi, MucHBLoaiXuatSac) VALUES 
(1, 1, 200000000, 5000000, 6500000, 8000000), (1, 2, 150000000, 5000000, 6500000, 8000000), 
(1, 3, 100000000, 4500000, 6000000, 7500000),
(2, 1, 250000000, 5500000, 7000000, 8500000), (2, 2, 150000000, 5000000, 6500000, 8000000);

-- =================================================================================
-- 6. HỒ SƠ XÉT HỌC BỔNG
-- =================================================================================
-- HỒ SƠ ĐỢT 1 (Đã chốt chính thức)
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, DiemHocTap, GPA, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('23115053122101', 1, '2024-02-10', 3.8, 3.8, 95, N'Xuất sắc', 'ChinhThuc', 4),
('23115053122102', 1, '2024-02-11', 3.6, 3.6, 90, N'Giỏi', 'ChinhThuc', 4),
('23115053122105', 1, '2024-02-14', 3.2, 3.2, 80, N'Khá', 'ChinhThuc', 4),
('23115053122103', 1, '2024-02-15', 2.5, 2.5, 65, NULL, 'TuChoi', 4);

-- HỒ SƠ ĐỢT 2 (Chờ CTSV trình lên Hiệu trưởng) - SỬ DỤNG ĐỂ TEST
INSERT INTO [HOSOXETHOCBONG] (MaSV, MaDot, NgayNop, DiemHocTap, GPA, DiemRenLuyen, XepLoaiHB, TrangThai, MaCB_Duyet) VALUES 
('23115053122104', 2, '2024-07-12', 3.9, 3.9, 98, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053122106', 2, '2024-07-12', 3.7, 3.7, 85, N'Giỏi', 'HoiDongDuyet', 4),
('23115053122109', 2, '2024-07-13', 3.8, 3.8, 92, N'Xuất sắc', 'HoiDongDuyet', 4),
('23115053122107', 2, '2024-07-14', 3.5, 3.5, 88, N'Giỏi', 'HoiDongDuyet', 4),
('23115053122108', 2, '2024-07-16', 3.1, 3.1, 75, NULL, 'TuChoi', 4),
('23115053122110', 2, '2024-07-16', 2.8, 2.8, 70, NULL, 'ChoXet', NULL);

-- =================================================================================
-- 7. KHIẾU NẠI (Gắn cho đợt 1)
-- =================================================================================
INSERT INTO [KHIEUNAI] (MaHoSo, NoiDung, MinhChung, NgayGui, TrangThai, MaCB_Duyet) VALUES 
(4, N'Lỗi hệ thống ghi nhận thiếu điểm rèn luyện', 'link_driver_1', '2024-02-20', 'DaXuLy', 2);

-- =================================================================================
-- 8. DANH SÁCH HỌC BỔNG ĐƯỢC DUYỆT VÀ CHI TRẢ (CHỈ CÓ Ở ĐỢT 1)
-- =================================================================================
INSERT INTO [DSHOCBONG] (MaDot, MaSV, XepLoai, SoTien, NgayPheDuyet, MaCB_PheDuyet) VALUES 
(1, '23115053122101', N'Xuất sắc', 8000000, '2024-03-01', 6),
(1, '23115053122102', N'Giỏi', 6500000, '2024-03-01', 6),
(1, '23115053122105', N'Khá', 5000000, '2024-03-01', 6);

INSERT INTO [CHITRA] (MaHoSo, SoTien, NgayXacNhan, TrangThai, MaCB_GiaiNgan) VALUES 
(1, 8000000, '2024-03-15', 'DaGiaiNgan', 3),
(2, 6500000, '2024-03-15', 'DaGiaiNgan', 3),
(3, 5000000, NULL, 'ChuaGiaiNgan', NULL);