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

public class DiemService : IDiemService
{
    private readonly ISinhVienRepository _sinhVienRepository;
    private readonly IKetQuaHocTapRepository _ketQuaHocTapRepository;
    private readonly IDiemRenLuyenRepository _diemRenLuyenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _context;
    private readonly ILogger<DiemService> _logger;

    public DiemService(
        ISinhVienRepository sinhVienRepository,
        IKetQuaHocTapRepository ketQuaHocTapRepository,
        IDiemRenLuyenRepository diemRenLuyenRepository,
        IUnitOfWork unitOfWork,
        AppDbContext context,
        ILogger<DiemService> logger)
    {
        _sinhVienRepository = sinhVienRepository;
        _ketQuaHocTapRepository = ketQuaHocTapRepository;
        _diemRenLuyenRepository = diemRenLuyenRepository;
        _unitOfWork = unitOfWork;
        _context = context;
        _logger = logger;
    }

    public async Task<ImportResultDTO> ImportDuLieuHocVuAsync(List<ImportHocVuRequest> requests)
    {
        _logger.LogInformation("ImportDuLieuHocVuAsync start. Count={Count}", requests?.Count ?? 0);

        if (requests == null || requests.Count == 0)
        {
            return new ImportResultDTO();
        }

        await using var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var danhSachMaSV = requests.Select(x => x.MaSV).ToList();
            var maSVTonTai = await _sinhVienRepository.LayDanhSachMaSVTonTaiAsync(danhSachMaSV);

            var danhSachLoi = new List<string>();
            var danhSachKetQua = new List<KetQuaHocTap>();
            var danhSachDRL = new List<DiemRenLuyen>();

            foreach (var item in requests)
            {
                var maSv = item.MaSV?.Trim();
                if (string.IsNullOrWhiteSpace(maSv) || !maSVTonTai.Contains(maSv))
                {
                    danhSachLoi.Add(item.MaSV ?? string.Empty);
                    continue;
                }

                danhSachKetQua.Add(new KetQuaHocTap
                {
                    MaSV = maSv,
                    HocKy = item.HocKy,
                    NamHoc = item.NamHoc,
                    GPA = item.GPA,
                    DiemHocTap = item.DiemHocTap,
                    SoTC = item.SoTC,
                    CoDiemF = item.CoDiemF,
                    MaCB_Nhap = null
                });

                danhSachDRL.Add(new DiemRenLuyen
                {
                    MaSV = maSv,
                    HocKy = item.HocKy,
                    NamHoc = item.NamHoc,
                    DiemSo = item.DiemSoDRL,
                    MaCB_Nhap = null
                });
            }

            await _ketQuaHocTapRepository.ThemNhieuAsync(danhSachKetQua);
            await _diemRenLuyenRepository.ThemNhieuAsync(danhSachDRL);
            await _unitOfWork.SaveChangesAsync();

            // ── Trigger: Tự động chuyển DotHocBong KhoiTao → DaCoDiem ──────────
            if (danhSachKetQua.Count > 0)
            {
                var firstItem = requests.First(r => !string.IsNullOrWhiteSpace(r.MaSV));
                var hocKy = firstItem.HocKy;
                var namHoc = firstItem.NamHoc?.Trim();

                var dotKhoiTao = await _context.DotHocBongs
                    .Where(d => d.HocKy == hocKy
                             && d.NamHoc == namHoc
                             && d.TrangThai == TrangThaiHocBong.KhoiTao)
                    .FirstOrDefaultAsync();

                if (dotKhoiTao != null)
                {
                    dotKhoiTao.TrangThai = TrangThaiHocBong.DaCoDiem;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation(
                        "Trigger: DotHocBong MaDot={MaDot} chuyen sang DaCoDiem.",
                        dotKhoiTao.MaDot);
                }
            }

            await transaction.CommitAsync();

            var result = new ImportResultDTO
            {
                ThanhCong = danhSachKetQua.Count,
                ThatBai = danhSachLoi.Count,
                DanhSachLoi = danhSachLoi
            };

            _logger.LogInformation(
                "ImportDuLieuHocVuAsync done. ThanhCong={ThanhCong} ThatBai={ThatBai}",
                result.ThanhCong,
                result.ThatBai);

            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "ImportDuLieuHocVuAsync failed.");
            throw;
        }
    }
}
