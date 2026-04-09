using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IDotHocBongRepository
{
    Task<DotHocBong> ThemAsync(DotHocBong dotHocBong);
}
