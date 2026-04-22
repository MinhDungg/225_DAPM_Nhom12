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

            // Anti-double-click: Xóa TẤT CẢ hồ sơ cũ của đợt này (không chỉ ChoXet)
            await _hoSoXetHocBongRepository.XoaTatCaHoSoTheoMaDotAsync(maDot);

            // Lấy TẤT CẢ sinh viên có điểm trong kỳ (kể cả không đủ điều kiện)
            var tatCaUngVien = await _ketQuaHocTapRepository.LayTatCaUngVienTheoKyAsync(
                dot.HocKy,
                dot.NamHoc);

            var danhSachHoSo = new List<HoSoXetHocBong>();

            foreach (var u in tatCaUngVien)
            {
                var ghiChu = new List<string>();
                var trangThai = TrangThaiHocBong.ChoXet;

                // Bộ lọc V3: Check từng điều kiện
                if (u.GPA < 2.5f)
                {
                    ghiChu.Add("GPA < 2.5");
                }
                if (u.SoTC < 15)
                {
                    ghiChu.Add("Số TC < 15");
                }
                if (u.CoDiemF)
                {
                    ghiChu.Add("Có môn F");
                }
                if (u.DiemRenLuyen < 65)
                {
                    ghiChu.Add("Điểm Rèn Luyện < 65");
                }

                // Nếu có bất kỳ lý do nào → Loại
                if (ghiChu.Count > 0)
                {
                    trangThai = TrangThaiHocBong.Loai;
                }

                danhSachHoSo.Add(new HoSoXetHocBong
                {
                    MaSV = u.MaSV,
                    MaDot = maDot,
                    NgayNop = DateTime.Now,
                    GPA = u.GPA,
                    DiemHocTap = u.DiemHocTap,
                    DiemRenLuyen = u.DiemRenLuyen,
                    TrangThai = trangThai,
                    GhiChu = ghiChu.Count > 0 ? string.Join("; ", ghiChu) + ";" : null
                });
            }

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
