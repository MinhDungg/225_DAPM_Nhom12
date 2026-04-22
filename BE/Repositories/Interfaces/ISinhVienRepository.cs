namespace BE.Repositories.Interfaces;

public interface ISinhVienRepository
{
    Task<HashSet<string>> LayDanhSachMaSVTonTaiAsync(IEnumerable<string> danhSachMaSV);

    /// <summary>
    /// Trả về danh sách { MaSV, HoTen } cho các mã SV tồn tại trong DB.
    /// </summary>
    Task<List<(string MaSV, string HoTen)>> LayDanhSachTheoMaSVAsync(IEnumerable<string> danhSachMaSV);
}

