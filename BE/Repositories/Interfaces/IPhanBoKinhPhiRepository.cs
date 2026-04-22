using BE.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Repositories.Interfaces;

public interface IPhanBoKinhPhiRepository
{
    Task<PhanBoKinhPhi?> LayTheoMaDotVaMaKhoaAsync(int maDot, int maKhoa);
    Task ThemAsync(PhanBoKinhPhi phanBoKinhPhi);
    void CapNhat(PhanBoKinhPhi phanBoKinhPhi);

    Task<List<PhanBoKinhPhi>> LayTheoMaDotAsync(int maDot);
}