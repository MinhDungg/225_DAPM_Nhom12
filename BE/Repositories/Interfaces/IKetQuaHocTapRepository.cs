using BE.DTOs.Response;
using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IKetQuaHocTapRepository
{
    Task ThemNhieuAsync(IEnumerable<KetQuaHocTap> danhSach);
    Task<List<UngVienDiemDTO>> LayUngVienDuDieuKienAsync(
        int hocKy,
        string namHoc,
        double minGpa,
        int minSoTc,
        int minDiemRenLuyen);
}

