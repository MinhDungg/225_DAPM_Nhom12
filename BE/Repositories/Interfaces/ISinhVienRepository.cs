namespace BE.Repositories.Interfaces;

public interface ISinhVienRepository
{
    Task<HashSet<string>> LayDanhSachMaSVTonTaiAsync(IEnumerable<string> danhSachMaSV);
}

