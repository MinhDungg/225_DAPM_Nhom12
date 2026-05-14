using BE.DTOs.Response;
using BE.Services;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using BE.Services.Implementations;
namespace BE.Controllers;

[ApiController]
[Route("api/export")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly ExportService _export;
    private readonly IFinalDecisionService _finalDecisionService;
    private readonly IKhoaService _khoaService;
    private readonly IKinhPhiService _kinhPhiService;

    public ExportController(ExportService export, IFinalDecisionService finalDecisionService,
        IKhoaService khoaService, IKinhPhiService kinhPhiService)
    {
        _export = export;
        _finalDecisionService = finalDecisionService;
        _khoaService = khoaService;
        _kinhPhiService = kinhPhiService;
    }

    private int? GetUserId() =>
        int.TryParse(
            (User.FindFirst("UserId") ?? User.FindFirst(ClaimTypes.NameIdentifier))?.Value,
            out int id) ? id : null;

    // Headers chung cho HoSo
    static readonly List<string> HoSoHeaders = new()
        { "Mã HS", "Mã SV", "Họ Tên", "Lớp", "Khoa", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Trạng Thái" };

    static List<Dictionary<string, string>> MapHoSo(IEnumerable<HoSoResponseDTO> list) =>
        list.Select(x => new Dictionary<string, string>
        {
            ["Mã HS"]       = x.MaHoSo.ToString(),
            ["Mã SV"]       = x.MaSV ?? "",
            ["Họ Tên"]      = x.HoTen ?? "",
            ["Lớp"]         = x.TenLop ?? "",
            ["Khoa"]        = x.TenKhoa ?? "",
            ["GPA"]         = x.GPA.ToString("F2"),
            ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
            ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
            ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
            ["Trạng Thái"]  = x.TrangThai ?? ""
        }).ToList();

    // ── HỘI ĐỒNG ─────────────────────────────────────────────────

    [HttpGet("hoidong/excel")]
    [Authorize(Roles = "CTSV,HoiDong")]
    public async Task<IActionResult> HoiDongExcel([FromQuery] int? maDot)
    {
        try
        {
            bool isHoiDong = User.IsInRole("HoiDong");
            var data = await _finalDecisionService.GetRecommendedProfilesAsync(isHoiDong, maDot);
            var bytes = _export.ToExcel(MapHoSo(data), HoSoHeaders, "Hội Đồng");
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"HoiDong_HoSo_{DateTime.Now:yyyyMMdd}.xlsx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo Excel: " + ex.Message });
        }
    }

    [HttpGet("hoidong/pdf")]
    [Authorize(Roles = "CTSV,HoiDong")]
    public async Task<IActionResult> HoiDongPdf([FromQuery] int? maDot)
    {
        try
        {
            bool isHoiDong = User.IsInRole("HoiDong");
            var data = await _finalDecisionService.GetRecommendedProfilesAsync(isHoiDong, maDot);
            var bytes = _export.ToHtml(MapHoSo(data), HoSoHeaders, "Danh Sách Hồ Sơ — Hội Đồng Xét Duyệt");
            return File(bytes, "text/html; charset=utf-8", $"HoiDong_HoSo_{DateTime.Now:yyyyMMdd}.html");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo PDF: " + ex.Message });
        }
}


    // ── KHOA ─────────────────────────────────────────────────────

    [HttpGet("khoa/excel")]
    public async Task<IActionResult> KhoaExcel([FromQuery] int? maDot)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var data = maDot.HasValue ?
                await _khoaService.LayDanhSachChoXetTheoDotAsync(userId.Value, maDot.Value):
                await _khoaService.LayDanhSachChoDuyetAsync(userId.Value);
            var rows = data.Select(x => new Dictionary<string, string>
            {
                ["Mã HS"]       = x.MaHoSo.ToString(),
                ["Mã SV"]       = x.MaSV ?? "",
                ["Họ Tên"]      = x.HoTenSinhVien ?? "",
                ["Lớp"]         = x.TenLop ?? "",
                ["GPA"]         = x.GPA.ToString("F2"),
                ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
                ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
                ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
                ["Trạng Thái"]  = x.TrangThai ?? ""
            }).ToList();
            var headers = new List<string> { "Mã HS", "Mã SV", "Họ Tên", "Lớp", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Trạng Thái" };
            var bytes = _export.ToExcel(rows, headers, "Khoa");
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Khoa_DanhSach_{DateTime.Now:yyyyMMdd}.xlsx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo Excel: " + ex.Message });
        }
    }

    [HttpGet("khoa/pdf")]
    public async Task<IActionResult> KhoaPdf([FromQuery] int? maDot)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            var data = maDot.HasValue ?
                await _khoaService.LayDanhSachChoXetTheoDotAsync(userId.Value, maDot.Value):
                await _khoaService.LayDanhSachChoDuyetAsync(userId.Value);
            var rows = data.Select(x => new Dictionary<string, string>
            {
                ["Mã HS"]       = x.MaHoSo.ToString(),
                ["Mã SV"]       = x.MaSV ?? "",
                ["Họ Tên"]      = x.HoTenSinhVien ?? "",
                ["Lớp"]         = x.TenLop ?? "",
                ["GPA"]         = x.GPA.ToString("F2"),
                ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
                ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
                ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
                ["Trạng Thái"]  = x.TrangThai ?? ""
            }).ToList();
            var headers = new List<string> { "Mã HS", "Mã SV", "Họ Tên", "Lớp", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Trạng Thái" };
            var bytes = _export.ToHtml(rows, headers, "Danh Sách Hồ Sơ — Khoa");
            return File(bytes, "text/html; charset=utf-8", $"Khoa_DanhSach_{DateTime.Now:yyyyMMdd}.html");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo PDF: " + ex.Message });
        }
    }

    // ── TÀI CHÍNH ────────────────────────────────────────────────

    [HttpGet("taichinh/excel/{maDot:int}")]
    [Authorize(Roles = "KHTC,CTSV")]
    public async Task<IActionResult> TaiChinhExcel(int maDot)
    {
        try
        {
            var data = await _kinhPhiService.LayPhanBoTheoMaDotAsync(maDot);
            var rows = (data ?? new()).Select(x => new Dictionary<string, string>
            {
                ["Mã Phân Bổ"]      = x.MaPhanBo.ToString(),
                ["Mã Đợt"]          = x.MaDot.ToString(),
                ["Mã Khoa"]         = x.MaKhoa.ToString(),
                ["Kinh Phí"]        = x.KinhPhi.ToString("N0"),
                ["Mức HB Loại Khá"] = x.MucHBLoaiKha.ToString("N0")
            }).ToList();
            var headers = new List<string> { "Mã Phân Bổ", "Mã Đợt", "Mã Khoa", "Kinh Phí", "Mức HB Loại Khá" };
            var bytes = _export.ToExcel(rows, headers, "Kinh Phí");
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"TaiChinh_KinhPhi_{maDot}_{DateTime.Now:yyyyMMdd}.xlsx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo Excel: " + ex.Message });
        }
    }

    [HttpGet("taichinh/pdf/{maDot:int}")]
    [Authorize(Roles = "KHTC,CTSV")]
    public async Task<IActionResult> TaiChinhPdf(int maDot)
    {
        try
        {
            var data = await _kinhPhiService.LayPhanBoTheoMaDotAsync(maDot);
            var rows = (data ?? new()).Select(x => new Dictionary<string, string>
            {
                ["Mã Phân Bổ"]      = x.MaPhanBo.ToString(),
                ["Mã Đợt"]          = x.MaDot.ToString(),
                ["Mã Khoa"]         = x.MaKhoa.ToString(),
                ["Kinh Phí"]        = x.KinhPhi.ToString("N0"),
                ["Mức HB Loại Khá"] = x.MucHBLoaiKha.ToString("N0")
            }).ToList();
            var headers = new List<string> { "Mã Phân Bổ", "Mã Đợt", "Mã Khoa", "Kinh Phí", "Mức HB Loại Khá" };
            var bytes = _export.ToHtml(rows, headers, $"Phân Bổ Kinh Phí — Đợt {maDot}");
            return File(bytes, "text/html; charset=utf-8", $"TaiChinh_KinhPhi_{maDot}_{DateTime.Now:yyyyMMdd}.html");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo PDF: " + ex.Message });
        }
    }
}
