using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Helpers;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BE.Services.Implementations;

public class DotHocBongService : IDotHocBongService
{
    private readonly IDotHocBongRepository _dotHocBongRepository;
    private readonly IKetQuaHocTapRepository _ketQuaHocTapRepository;
    private readonly IHoSoXetHocBongRepository _hoSoXetHocBongRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;
    private readonly ILogger<DotHocBongService> _logger;

    public DotHocBongService(
        IDotHocBongRepository dotHocBongRepository,
        IKetQuaHocTapRepository ketQuaHocTapRepository,
        IHoSoXetHocBongRepository hoSoXetHocBongRepository,
        IUnitOfWork unitOfWork,
        AppDbContext context,
        ILogger<DotHocBongService> logger)
    {
        _dotHocBongRepository = dotHocBongRepository;
        _ketQuaHocTapRepository = ketQuaHocTapRepository;
        _hoSoXetHocBongRepository = hoSoXetHocBongRepository;
        _unitOfWork = unitOfWork;
        _context = context;
        _logger = logger;
    }

    public async Task<DotHocBongResponseDTO> CreateDotHocBongAsync(DotHocBongCreateDTO request)
    {
        // Double-guard: kiểm tra trùng học kỳ + năm học
        var trungLap = await _dotHocBongRepository.KiemTraTonTaiHocKyNamHocAsync(
            request.HocKy, request.NamHoc);
        if (trungLap)
        {
            throw new InvalidOperationException(
                $"Học kỳ {request.HocKy} năm học {request.NamHoc} đã tồn tại trong hệ thống!");
        }

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
            TrangThai = created.TrangThai,
            DaCoDiem = false,
            DaCoKinhPhi = false
        };
    }

    public async Task<DotHocBongResponseDTO?> UpdateDotHocBongAsync(int maDot, DotHocBongUpdateDTO request)
    {
        var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
        if (dot == null) return null;

        // Double-guard: kiểm tra trùng, loại trừ chính đợt đang sửa
        var trungLap = await _dotHocBongRepository.KiemTraTonTaiHocKyNamHocAsync(
            request.HocKy, request.NamHoc, excludeMaDot: maDot);
        if (trungLap)
        {
            throw new InvalidOperationException(
                $"Học kỳ {request.HocKy} năm học {request.NamHoc} đã tồn tại trong hệ thống!");
        }

        dot.LoaiDot = request.LoaiDot;
        dot.HocKy = request.HocKy;
        dot.NamHoc = request.NamHoc;
        _dotHocBongRepository.CapNhat(dot);
        await _unitOfWork.SaveChangesAsync();

        return new DotHocBongResponseDTO
        {
            MaDot = dot.MaDot,
            LoaiDot = dot.LoaiDot,
            HocKy = dot.HocKy,
            NamHoc = dot.NamHoc,
            TrangThai = dot.TrangThai,
            DaCoDiem = await _context.KetQuaHocTaps.AnyAsync(k => k.HocKy == dot.HocKy && k.NamHoc == dot.NamHoc),
            DaCoKinhPhi = await _context.PhanBoKinhPhis.AnyAsync(p => p.MaDot == dot.MaDot)
        };
    }

    public async Task<bool> DeleteDotHocBongAsync(int maDot)
    {
        var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
        if (dot == null) return false;

        // Chỉ cho xóa khi trạng thái là KhoiTao hoặc DaCoDiem
        if (dot.TrangThai != TrangThaiHocBong.KhoiTao &&
            dot.TrangThai != TrangThaiHocBong.DaCoDiem)
        {
            throw new InvalidOperationException(
                $"Khong the xoa dot co trang thai '{dot.TrangThai}'. Chi cho phep xoa khi KhoiTao hoac DaCoDiem.");
        }

        return await _dotHocBongRepository.XoaAsync(maDot);
    }

    public async Task<IEnumerable<DotHocBongResponseDTO>> GetAllDotHocBongAsync()
    {
        var dsDotHocBong = await _dotHocBongRepository.LayDanhSachAsync();

        // Build result with EXISTS checks — one query per dot using LINQ .Any()
        var result = new List<DotHocBongResponseDTO>();
        foreach (var d in dsDotHocBong)
        {
            // EXISTS: có điểm cho học kỳ/năm học này không?
            var daCoDiem = await _context.KetQuaHocTaps
                .AnyAsync(k => k.HocKy == d.HocKy && k.NamHoc == d.NamHoc);

            // EXISTS: có phân bổ kinh phí cho đợt này không?
            var daCoKinhPhi = await _context.PhanBoKinhPhis
                .AnyAsync(p => p.MaDot == d.MaDot);

            result.Add(new DotHocBongResponseDTO
            {
                MaDot = d.MaDot,
                LoaiDot = d.LoaiDot,
                HocKy = d.HocKy,
                NamHoc = d.NamHoc,
                TrangThai = d.TrangThai,
                DaCoDiem = daCoDiem,
                DaCoKinhPhi = daCoKinhPhi
            });
        }

        return result;
    }

    public async Task<List<UngVienResponseDTO>> GetDanhSachUngVienAsync(int maDot)
    {
        return await _hoSoXetHocBongRepository.LayDanhSachUngVienTheoMaDotAsync(maDot);
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

            // Chốt chặn: Chỉ quét khi đợt đã có điểm (DaCoDiem)
            if (dot.TrangThai != TrangThaiHocBong.DaCoDiem)
            {
                throw new InvalidOperationException(
                    $"Khong the quet ung vien. Dot hoc bong phai o trang thai 'DaCoDiem' (hien tai: '{dot.TrangThai}').");
            }

            // Anti-double-click: Xóa TẤT CẢ hồ sơ cũ của đợt này
            await _hoSoXetHocBongRepository.XoaTatCaHoSoTheoMaDotAsync(maDot);

            // Lấy TẤT CẢ sinh viên có điểm trong kỳ
            var tatCaUngVien = await _ketQuaHocTapRepository.LayTatCaUngVienTheoKyAsync(
                dot.HocKy,
                dot.NamHoc);

            var danhSachHoSo = new List<HoSoXetHocBong>();

            foreach (var u in tatCaUngVien)
            {
                var ghiChu = new List<string>();
                var trangThai = TrangThaiHocBong.ChoXet;

                if (u.GPA < 2.5f) ghiChu.Add("GPA < 2.5");
                if (u.SoTC < 15) ghiChu.Add("Số TC < 15");
                if (u.CoDiemF) ghiChu.Add("Có môn F");
                if (u.DiemRenLuyen < 65) ghiChu.Add("Điểm Rèn Luyện < 65");

                if (ghiChu.Count > 0) trangThai = TrangThaiHocBong.Loai;

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
