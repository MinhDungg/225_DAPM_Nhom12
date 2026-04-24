-- =====================================================================
-- SCRIPT SỬA LỖI DATABASE: ĐIỂM HỌC TẬP HỆ 10 VÀ RÀNG BUỘC (CONSTRAINT)
-- =====================================================================
USE dbQLHocBong;
GO

-- Xóa ràng buộc cũ đang ép DiemHocTap phải <= 4.0
ALTER TABLE [HOSOXETHOCBONG] DROP CONSTRAINT IF EXISTS [CHK_GPA_HoSo];

-- Tạo lại ràng buộc đúng: GPA <= 4.0 và DiemHocTap <= 10.0
ALTER TABLE [HOSOXETHOCBONG] ADD CONSTRAINT [CHK_GPA_HoSo] CHECK ([GPA] >= 0.0 AND [GPA] <= 4.0);
ALTER TABLE [HOSOXETHOCBONG] ADD CONSTRAINT [CHK_DiemHocTap_HoSo] CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 10.0);
-- Bảng KETQUAHOCTAP cũng cần thêm ràng buộc hệ 10 cho chắc chắn
ALTER TABLE [KETQUAHOCTAP] ADD CONSTRAINT [CHK_DiemHocTap_KQHT] CHECK ([DiemHocTap] >= 0.0 AND [DiemHocTap] <= 10.0);
GO

-- =====================================================================
-- BẢNG KẾT QUẢ HỌC TẬP
-- =====================================================================
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 9.1 WHERE MaSV = '23115053122101';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 8.6 WHERE MaSV = '23115053122102';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 6.2 WHERE MaSV = '23115053122103';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 9.4 WHERE MaSV = '23115053122104';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 7.6 WHERE MaSV = '23115053122105';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 8.9 WHERE MaSV = '23115053122106';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 8.4 WHERE MaSV = '23115053122107';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 7.3 WHERE MaSV = '23115053122108';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 9.2 WHERE MaSV = '23115053122109';
UPDATE [KETQUAHOCTAP] SET DiemHocTap = 6.8 WHERE MaSV = '23115053122110';

-- =====================================================================
-- BẢNG HỒ SƠ XÉT HỌC BỔNG
-- =====================================================================
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 9.1 WHERE MaSV = '23115053122101';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 8.6 WHERE MaSV = '23115053122102';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 7.6 WHERE MaSV = '23115053122105';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 6.2 WHERE MaSV = '23115053122103';

UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 9.4 WHERE MaSV = '23115053122104';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 8.9 WHERE MaSV = '23115053122106';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 9.2 WHERE MaSV = '23115053122109';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 8.4 WHERE MaSV = '23115053122107';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 7.3 WHERE MaSV = '23115053122108';
UPDATE [HOSOXETHOCBONG] SET DiemHocTap = 6.8 WHERE MaSV = '23115053122110';
GO

