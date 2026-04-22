using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IHoSoXetHocBongRepository
{
    Task XoaHoSoChoXetTheoMaDotAsync(int maDot, string trangThaiChoXet);
    Task ThemNhieuAsync(IEnumerable<HoSoXetHocBong> danhSach);

    Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaAsync(int maKhoa);
    Task<List<HoSoXetHocBong>> LayDanhSachChoDuyetTheoKhoaVaDotAsync(int maKhoa, int maDot);
    Task CapNhatXepLoaiVaTrangThaiAsync(List<HoSoXetHocBong> hoSos);
    Task<int> ChotDanhSachDeXuatAsync(int maKhoa, int maDot, List<int> danhSachMaHoSo, int maCB);

    Task<IEnumerable<HoSoXetHocBong>> GetProfilesByStatusAsync(string status);
    Task<bool> UpdateProfilesStatusAsync(List<int> profileIds, string newStatus);

    Task<IEnumerable<HoSoXetHocBong>> GetProfilesByMaSVAsync(string maSV);

    Task<HoSoXetHocBong?> GetByIdAsync(int id);
    Task<bool> FinalizeScholarshipRoundAsync(int maDot, int maCB_PheDuyet);
}
