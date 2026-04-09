using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;

namespace BE.Services.Implementations;

public class DotHocBongService : IDotHocBongService
{
    private readonly IDotHocBongRepository _dotHocBongRepository;

    public DotHocBongService(IDotHocBongRepository dotHocBongRepository)
    {
        _dotHocBongRepository = dotHocBongRepository;
    }

    public async Task<DotHocBongResponseDTO> CreateDotHocBongAsync(DotHocBongCreateDTO request)
    {
        var dotHocBong = new DotHocBong
        {
            LoaiDot = request.LoaiDot,
            HocKy = request.HocKy,
            NamHoc = request.NamHoc,
            TrangThai = "KhoiTao"
        };

        var created = await _dotHocBongRepository.ThemAsync(dotHocBong);

        return new DotHocBongResponseDTO
        {
            MaDot = created.MaDot,
            LoaiDot = created.LoaiDot,
            HocKy = created.HocKy,
            NamHoc = created.NamHoc,
            TrangThai = created.TrangThai
        };
    }
}
