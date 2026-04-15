using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IHoSoXetHocBongRepository
{
    Task XoaHoSoChoXetTheoMaDotAsync(int maDot, string trangThaiChoXet);
    Task ThemNhieuAsync(IEnumerable<HoSoXetHocBong> danhSach);
}

