using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace BE.Services.Implementations;

public class KinhPhiService : IKinhPhiService
{
    private readonly IDotHocBongRepository _dotHocBongRepository;
    private readonly IKhoaRepository _khoaRepository;
    private readonly IPhanBoKinhPhiRepository _phanBoKinhPhiRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<KinhPhiService> _logger;

    public KinhPhiService(
        IDotHocBongRepository dotHocBongRepository,
        IKhoaRepository khoaRepository,
        IPhanBoKinhPhiRepository phanBoKinhPhiRepository,
        IUnitOfWork unitOfWork,
        ILogger<KinhPhiService> logger)
    {
        _dotHocBongRepository = dotHocBongRepository;
        _khoaRepository = khoaRepository;
        _phanBoKinhPhiRepository = phanBoKinhPhiRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PhanBoKinhPhiResponseDTO?> ThietLapKinhPhiAsync(ThietLapKinhPhiRequest request)
    {
        _logger.LogInformation(
            "ThietLapKinhPhiAsync start. MaDot={MaDot} MaKhoa={MaKhoa}",
            request.MaDot,
            request.MaKhoa);

        var dot = await _dotHocBongRepository.LayTheoIdAsync(request.MaDot);
        if (dot == null)
        {
            return null;
        }

        if (!await _khoaRepository.TonTaiAsync(request.MaKhoa))
        {
            return null;
        }

        var phanBo = await _phanBoKinhPhiRepository.LayTheoMaDotVaMaKhoaAsync(request.MaDot, request.MaKhoa);
        if (phanBo == null)
        {
            phanBo = new PhanBoKinhPhi
            {
                MaDot = request.MaDot,
                MaKhoa = request.MaKhoa,
                KinhPhi = request.KinhPhi,
                MucHBLoaiKha = request.MucHBLoaiKha
            };

            await _phanBoKinhPhiRepository.ThemAsync(phanBo);
        }
        else
        {
            phanBo.KinhPhi = request.KinhPhi;
            phanBo.MucHBLoaiKha = request.MucHBLoaiKha;
            _phanBoKinhPhiRepository.CapNhat(phanBo);
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation(
            "ThietLapKinhPhiAsync done. MaPhanBo={MaPhanBo}",
            phanBo.MaPhanBo);

        return new PhanBoKinhPhiResponseDTO
        {
            MaPhanBo = phanBo.MaPhanBo,
            MaDot = phanBo.MaDot,
            MaKhoa = phanBo.MaKhoa,
            KinhPhi = phanBo.KinhPhi,
            MucHBLoaiKha = phanBo.MucHBLoaiKha
        };
    }

    public async Task<List<PhanBoKinhPhiResponseDTO>> LayPhanBoTheoMaDotAsync(int maDot)
    {
        var danhSach = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(maDot);
        return danhSach.Select(p => new PhanBoKinhPhiResponseDTO
        {
            MaPhanBo = p.MaPhanBo,
            MaDot = p.MaDot,
            MaKhoa = p.MaKhoa,
            KinhPhi = p.KinhPhi,
            MucHBLoaiKha = p.MucHBLoaiKha
        }).ToList();
    }
}

