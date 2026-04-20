using BE.Models;
using System.Threading.Tasks;

namespace BE.Repositories.Interfaces;

public interface IDotHocBongRepository
{
    Task<DotHocBong> ThemAsync(DotHocBong dotHocBong);
    Task<DotHocBong?> LayTheoIdAsync(int maDot); 
    void CapNhat(DotHocBong dotHocBong);
    Task<IEnumerable<DotHocBong>> LayDanhSachAsync();
}