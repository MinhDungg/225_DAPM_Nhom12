using BE.Models;

namespace BE.Repositories.Interfaces;

public interface IPhanBoKinhPhiRepository
{
    Task<PhanBoKinhPhi?> LayTheoMaDotVaMaKhoaAsync(int maDot, int maKhoa);
    Task ThemAsync(PhanBoKinhPhi phanBoKinhPhi);
    void CapNhat(PhanBoKinhPhi phanBoKinhPhi);
}

