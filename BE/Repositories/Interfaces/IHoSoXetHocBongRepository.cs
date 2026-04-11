using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IHoSoXetHocBongRepository
{
    Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaAsync(int maKhoa);
}
