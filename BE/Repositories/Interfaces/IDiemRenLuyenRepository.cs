using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IDiemRenLuyenRepository
{
    Task ThemNhieuAsync(IEnumerable<DiemRenLuyen> danhSach);
    Task<int?> GetDiemRenLuyenAsync(string maSV, int hocKy, string namHoc);
}

