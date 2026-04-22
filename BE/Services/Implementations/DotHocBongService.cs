using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Helpers;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace BE.Services.Implementations;

public class DotHocBongService : IDotHocBongService
{
    private readonly IDotHocBongRepository _dotHocBongRepository;
    private readonly IKetQuaHocTapRepository _ketQuaHocTapRepository;
    private readonly IHoSoXetHocBongRepository _hoSoXetHocBongRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DotHocBongService> _logger;

    public DotHocBongService(
        IDotHocBongRepository dotHocBongRepository,
        IKetQuaHocTapRepository ketQuaHocTapRepository,
        IHoSoXetHocBongRepository hoSoXetHocBongRepository,
        IUnitOfWork unitOfWork,
        ILogger<DotHocBongService> logger)
    {
        _dotHocBongRepository = dotHocBongRepository;
        _ketQuaHocTapRepository = ketQuaHocTapRepository;
        _hoSoXetHocBongRepository = hoSoXetHocBongRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<DotHocBongResponseDTO> CreateDotHocBongAsync(DotHocBongCreateDTO request)
    {
        var dotHocBong = new DotHocBong
        {
            LoaiDot = request.LoaiDot,
            HocKy = request.HocKy,
            NamHoc = request.NamHoc,
            TrangThai = TrangThaiHocBong.KhoiTao
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

    public async Task<IEnumerable<DotHocBongResponseDTO>> GetAllDotHocBongAsync()
    {
        var dsDotHocBong = await _dotHocBongRepository.LayDanhSachAsync(); // Giả sử repo của bạn có hàm này
        return dsDotHocBong.Select(d => new DotHocBongResponseDTO
        {
            MaDot = d.MaDot,
            LoaiDot = d.LoaiDot,
            HocKy = d.HocKy,
            NamHoc = d.NamHoc,
            TrangThai = d.TrangThai
        });
    }
    public async Task<AutoScanResultDTO?> AutoScanCandidatesAsync(int maDot)
    {
        _logger.LogInformation("AutoScanCandidatesAsync start. MaDot={MaDot}", maDot);

        await using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null)
            {
                return null;
            }

            await _hoSoXetHocBongRepository.XoaHoSoChoXetTheoMaDotAsync(maDot, TrangThaiHocBong.ChoXet);

            var ungVienDuDieuKien = await _ketQuaHocTapRepository.LayUngVienDuDieuKienAsync(
                dot.HocKy,
                dot.NamHoc,
                minGpa: 2.5,
                minSoTc: 15,
                minDiemRenLuyen: 65);

            var danhSachHoSo = ungVienDuDieuKien.Select(u => new HoSoXetHocBong
            {
                MaSV = u.MaSV,
                MaDot = maDot,
                NgayNop = DateTime.Now,
                DiemHocTap = (float)u.GPA,
                DiemRenLuyen = u.DiemRenLuyen,
                TrangThai = TrangThaiHocBong.ChoXet
            }).ToList();

            await _hoSoXetHocBongRepository.ThemNhieuAsync(danhSachHoSo);

            dot.TrangThai = TrangThaiHocBong.DangXetDuyet;
            _dotHocBongRepository.CapNhat(dot);

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "AutoScanCandidatesAsync done. MaDot={MaDot} SoLuongTao={SoLuongTao}",
                maDot,
                danhSachHoSo.Count);

            return new AutoScanResultDTO
            {
                MaDot = maDot,
                SoLuongTao = danhSachHoSo.Count
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "AutoScanCandidatesAsync failed. MaDot={MaDot}", maDot);
            throw;
        }
    }
}
