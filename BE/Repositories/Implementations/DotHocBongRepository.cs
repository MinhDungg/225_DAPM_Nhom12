using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;

namespace BE.Repositories.Implementations;

public class DotHocBongRepository : IDotHocBongRepository
{
    private readonly AppDbContext _context;

    public DotHocBongRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DotHocBong> ThemAsync(DotHocBong dotHocBong)
    {
        _context.DotHocBongs.Add(dotHocBong);
        await _context.SaveChangesAsync();
        return dotHocBong;
    }
}
