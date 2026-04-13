using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IHoSoXetHocBongRepository
{
    Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaAsync(int maKhoa);
    Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot);
    Task CapNhatXepLoaiVaTrangThaiAsync(List<HoSoXetHocBong> hoSos);
}
