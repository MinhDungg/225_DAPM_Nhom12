using BE.DTOs.Response;
using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IKetQuaHocTapRepository
{
    Task ThemNhieuAsync(IEnumerable<KetQuaHocTap> danhSach);

    /// <summary>
    /// Lấy danh sách ứng viên đủ điều kiện (dùng cho AutoScan V1 cũ).
    /// </summary>
    Task<List<UngVienDiemDTO>> LayUngVienDuDieuKienAsync(
        int hocKy,
        string namHoc,
        double minGpa,
        int minSoTc,
        int minDiemRenLuyen);

    /// <summary>
    /// Lấy TẤT CẢ sinh viên có điểm trong kỳ (kể cả không đủ điều kiện) — dùng cho AutoScan V3.
    /// </summary>
    Task<List<UngVienDiemDTO>> LayTatCaUngVienTheoKyAsync(int hocKy, string namHoc);
}
