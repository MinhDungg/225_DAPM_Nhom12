using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IDiemRenLuyenRepository
{
    Task ThemNhieuAsync(IEnumerable<DiemRenLuyen> danhSach);
}

