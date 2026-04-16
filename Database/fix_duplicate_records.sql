USE dbQLHocBong;
GO

-- ================================================
-- FIX DỮ LIỆU TRÙNG LẶP SINH VIÊN
-- ================================================

-- Bước 1: Kiểm tra các bản ghi trùng lặp
SELECT 
    MaSV, 
    HoTen, 
    COUNT(*) AS SoLanXuatHien
FROM SINHVIEN
GROUP BY MaSV, HoTen
HAVING COUNT(*) > 1;
GO

-- Bước 2: Kiểm tra các hồ sơ xét học bổng trùng lặp
SELECT 
    MaSV, 
    MaDot,
    COUNT(*) AS SoLanXuatHien
FROM HOSOXETHOCBONG
GROUP BY MaSV, MaDot
HAVING COUNT(*) > 1;
GO

-- Bước 3: Xóa các bản ghi hồ sơ trùng lặp (giữ lại bản ghi có MaHoSo nhỏ nhất)
WITH CTE_DuplicateHoSo AS (
    SELECT 
        MaHoSo,
        MaSV,
        MaDot,
        ROW_NUMBER() OVER (PARTITION BY MaSV, MaDot ORDER BY MaHoSo ASC) AS RowNum
    FROM HOSOXETHOCBONG
)
DELETE FROM HOSOXETHOCBONG
WHERE MaHoSo IN (
    SELECT MaHoSo 
    FROM CTE_DuplicateHoSo 
    WHERE RowNum > 1
);
GO

-- Bước 4: Kiểm tra lại sau khi xóa
SELECT 
    MaSV, 
    MaDot,
    COUNT(*) AS SoLanXuatHien
FROM HOSOXETHOCBONG
GROUP BY MaSV, MaDot
HAVING COUNT(*) > 1;
GO

PRINT 'Da xoa cac ban ghi trung lap thanh cong!';
GO
