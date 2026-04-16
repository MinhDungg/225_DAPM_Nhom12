using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Repositories.Implementations;

public class PhanBoKinhPhiRepository : IPhanBoKinhPhiRepository
{
    private readonly AppDbContext _context;

    public PhanBoKinhPhiRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<PhanBoKinhPhi?> LayTheoMaDotVaMaKhoaAsync(int maDot, int maKhoa)
    {
        return _context.PhanBoKinhPhis
            .FirstOrDefaultAsync(p => p.MaDot == maDot && p.MaKhoa == maKhoa);
    }

    public Task ThemAsync(PhanBoKinhPhi phanBoKinhPhi)
    {
        return _context.PhanBoKinhPhis.AddAsync(phanBoKinhPhi).AsTask();
    }

    public void CapNhat(PhanBoKinhPhi phanBoKinhPhi)
    {
        _context.PhanBoKinhPhis.Update(phanBoKinhPhi);
    }
}

