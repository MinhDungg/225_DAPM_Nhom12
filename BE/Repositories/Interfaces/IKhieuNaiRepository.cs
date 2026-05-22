using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IKhieuNaiRepository
{
    Task<KhieuNai?> GetByIdAsync(int id);              // Read-only (AsNoTracking)
    Task<KhieuNai?> GetByIdForUpdateAsync(int id);     // Dùng trước khi Update
    Task<IEnumerable<KhieuNai>> GetAllAsync();
    Task<IEnumerable<KhieuNai>> GetByMaSVAsync(string maSV);
    Task AddAsync(KhieuNai khieuNai);
    Task UpdateAsync(KhieuNai khieuNai);
}