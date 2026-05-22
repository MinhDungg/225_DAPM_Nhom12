using BE.Models;

namespace BE.Repositories.Interfaces;

public interface ITaiKhoanRepository
{
    Task<TaiKhoan?> LayTheoTenDangNhapAsync(string tenDangNhap);
}
