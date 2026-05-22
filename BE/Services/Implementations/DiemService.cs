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
            var danhSachMaSV = requests.Select(x => x.MaSV).Distinct().ToList();
            var maSVTonTai = await _sinhVienRepository.LayDanhSachMaSVTonTaiAsync(danhSachMaSV);

            // Lấy thông tin Học kỳ và Năm học để làm điều kiện xóa dữ liệu cũ
            var firstItem = requests.FirstOrDefault(r => !string.IsNullOrWhiteSpace(r.MaSV));
            if (firstItem != null)
            {
                var hocKy = firstItem.HocKy;
                var namHoc = firstItem.NamHoc?.Trim();

                // 1. XÓA DỮ LIỆU CŨ: Ngăn chặn lỗi Tích Đề-các (Cartesian Product) nhân bản dữ liệu
                var oldKQHT = await _context.KetQuaHocTaps
                    .Where(k => k.HocKy == hocKy && k.NamHoc == namHoc && danhSachMaSV.Contains(k.MaSV))
                    .ToListAsync();
                if (oldKQHT.Any()) _context.KetQuaHocTaps.RemoveRange(oldKQHT);

                var oldDRL = await _context.DiemRenLuyens
                    .Where(d => d.HocKy == hocKy && d.NamHoc == namHoc && danhSachMaSV.Contains(d.MaSV))
                    .ToListAsync();
                if (oldDRL.Any()) _context.DiemRenLuyens.RemoveRange(oldDRL);

                // Lưu thay đổi xóa trước khi Insert cái mới
                await _context.SaveChangesAsync();
            }

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

            // 2. THÊM DỮ LIỆU MỚI
            await _ketQuaHocTapRepository.ThemNhieuAsync(danhSachKetQua);
            await _diemRenLuyenRepository.ThemNhieuAsync(danhSachDRL);
            await _unitOfWork.SaveChangesAsync();

            // 3. TRIGGER CHUYỂN TRẠNG THÁI DOT_HOC_BONG
            if (danhSachKetQua.Count > 0 && firstItem != null)
            {
                var dotKhoiTao = await _context.DotHocBongs
                    .Where(d => d.HocKy == firstItem.HocKy
                            && d.NamHoc == firstItem.NamHoc
                            && d.TrangThai == TrangThaiHocBong.KhoiTao)
                    .FirstOrDefaultAsync();

                if (dotKhoiTao != null)
                {
                    dotKhoiTao.TrangThai = TrangThaiHocBong.DaCoDiem;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Trigger: DotHocBong MaDot={MaDot} chuyen sang DaCoDiem.", dotKhoiTao.MaDot);
                }
            }

            await transaction.CommitAsync();

            return new ImportResultDTO
            {
                ThanhCong = danhSachKetQua.Count,
                ThatBai = danhSachLoi.Count,
                DanhSachLoi = danhSachLoi
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "ImportDuLieuHocVuAsync failed.");
            throw;
        }
    }

    public async Task<IEnumerable<DuLieuHocVuResponseDTO>> GetDanhSachHocVuAsync(int? hocKy, string? namHoc)
    {
        _logger.LogInformation("GetDanhSachHocVuAsync start. HocKy={HocKy}, NamHoc={NamHoc}", hocKy, namHoc);

        var query = _context.KetQuaHocTaps
            .Include(k => k.SinhVien)
            .ThenInclude(s => s.Lop)
            .AsQueryable();

        if (hocKy.HasValue)
        {
            query = query.Where(k => k.HocKy == hocKy.Value);
        }

        if (!string.IsNullOrEmpty(namHoc))
        {
            query = query.Where(k => k.NamHoc == namHoc);
        }

        var list = await query.ToListAsync();

        return list.Select(k => new DuLieuHocVuResponseDTO
        {
            MaSV = k.MaSV,
            HoTen = k.SinhVien?.HoTen ?? "N/A",
            TenLop = k.SinhVien?.Lop?.TenLop ?? "N/A",
            HocKy = k.HocKy,
            NamHoc = k.NamHoc,
            GPA = k.GPA,
            DiemHocTap = k.DiemHocTap,
            SoTC = k.SoTC,
            CoDiemF = k.CoDiemF
        });
    }
}
