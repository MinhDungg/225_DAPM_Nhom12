using BE.Models;
using System.Threading.Tasks;

namespace BE.Repositories.Interfaces;

public interface IDotHocBongRepository
{
    Task<DotHocBong> ThemAsync(DotHocBong dotHocBong);
    Task<DotHocBong?> LayTheoIdAsync(int maDot);
    void CapNhat(DotHocBong dotHocBong);
    Task<IEnumerable<DotHocBong>> LayDanhSachAsync();
    Task<bool> XoaAsync(int maDot);

    /// <summary>
    /// Kiểm tra xem đã tồn tại đợt nào có cùng HocKy và NamHoc chưa.
    /// Tham số excludeMaDot dùng khi Update để loại trừ chính đợt đang sửa.
    /// </summary>
    Task<bool> KiemTraTonTaiHocKyNamHocAsync(int hocKy, string namHoc, int? excludeMaDot = null);
}