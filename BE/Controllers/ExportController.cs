using BE.Data;
using BE.DTOs.Response;
using BE.Services;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly AppDbContext _context;

    public ExportController(ExportService export, IFinalDecisionService finalDecisionService,
        IKhoaService khoaService, IKinhPhiService kinhPhiService, AppDbContext context)
    {
        _export = export;
        _finalDecisionService = finalDecisionService;
        _khoaService = khoaService;
        _kinhPhiService = kinhPhiService;
        _context = context;
    }

    private int? GetUserId() =>
        int.TryParse(
            (User.FindFirst("UserId") ?? User.FindFirst(ClaimTypes.NameIdentifier))?.Value,
            out int id) ? id : null;

    // Headers chung cho HoSo
    static readonly List<string> HoSoHeaders = new()
        { "STT", "Mã SV", "Họ Tên", "Lớp", "Khoa", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Mức Học Bổng", "Trạng Thái" };

    static List<Dictionary<string, string>> MapHoSo(IEnumerable<HoSoResponseDTO> list) {
        int stt = 1;
        var mapped = list.Select(x => new Dictionary<string, string>
        {
            ["STT"]         = (stt++).ToString(),
            ["Mã SV"]       = x.MaSV ?? "",
            ["Họ Tên"]      = x.HoTen ?? "",
            ["Lớp"]         = x.TenLop ?? "",
            ["Khoa"]        = x.TenKhoa ?? "",
            ["GPA"]         = x.GPA.ToString("F2"),
            ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
            ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
            ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
            ["Mức Học Bổng"]= x.MucHocBong.HasValue ? x.MucHocBong.Value.ToString("N0") + " đ" : "",
            ["Trạng Thái"]  = x.TrangThai ?? ""
        }).ToList();

        decimal totalSum = list.Sum(x => x.MucHocBong ?? 0);
        mapped.Add(new Dictionary<string, string>
        {
            ["STT"]         = "Tổng cộng",
            ["Mã SV"]       = "",
            ["Họ Tên"]      = "",
            ["Lớp"]         = "",
            ["Khoa"]        = "",
            ["GPA"]         = "",
            ["Điểm HT"]     = "",
            ["Điểm RL"]     = "",
            ["Xếp Loại HB"] = "",
            ["Mức Học Bổng"]= totalSum.ToString("N0") + " đ",
            ["Trạng Thái"]  = ""
        });
        return mapped;
    }

    // ── TEST EXCEL ─────────────────────────────────────────
    [HttpGet("test-excel")]
    [AllowAnonymous]
    public async Task<IActionResult> TestExcel([FromQuery] int? maDot)
    {
        var data = maDot.HasValue ?
            await _khoaService.LayDanhSachChoXetTheoDotAsync(1, maDot.Value) : 
            await _khoaService.LayDanhSachChoDuyetAsync(1);

        var filtered = data.Where(x => !string.IsNullOrWhiteSpace(x.XepLoaiHB)).ToList();
        
        // 1. Tính tổng tiền trước khi tạo hàng
        decimal totalSum = filtered.Sum(x => x.MucHocBong ?? 0);

        int stt = 1;
        var rows = filtered.Select(x => new Dictionary<string, string>
        {
            ["STT"]          = (stt++).ToString(),
            ["Mã SV"]        = x.MaSV ?? "",
            ["Họ Tên"]       = x.HoTenSinhVien ?? "",
            ["Lớp"]          = x.TenLop ?? "",
            ["GPA"]          = x.GPA.ToString("F2"),
            ["Điểm HT"]      = x.DiemHocTap.ToString("F2"),
            ["Điểm RL"]      = x.DiemRenLuyen.ToString("F2"),
            ["Xếp Loại HB"]  = x.XepLoaiHB ?? "",
            ["Mức Học Bổng"] = x.MucHocBong.HasValue ? x.MucHocBong.Value.ToString("N0") + " đ" : "",
            ["Trạng Thái"]   = x.TrangThai ?? ""
        }).ToList();

        // 2. Thêm dòng TỔNG CỘNG vào cuối danh sách
        rows.Add(new Dictionary<string, string>
        {
            ["STT"]          = "",
            ["Mã SV"]        = "",
            ["Họ Tên"]       = "",
            ["Lớp"]          = "",
            ["GPA"]          = "",
            ["Điểm HT"]      = "",
            ["Điểm RL"]      = "",
            ["Xếp Loại HB"]  = "TỔNG CỘNG", // Từ khóa này giúp Service nhận diện để Merge ô
            ["Mức Học Bổng"] = totalSum.ToString("N0") + " đ",
            ["Trạng Thái"]   = ""
        });
        
        var headers = new List<string> { "STT", "Mã SV", "Họ Tên", "Lớp", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Mức Học Bổng", "Trạng Thái" };
        
        // Gọi hàm ToExcel (Sử dụng hàm dùng ClosedXML đã cung cấp ở tin nhắn trước)
        var stream = _export.ToExcel(rows, headers, "DS Dự Kiến");
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Test.xlsx");
    }

    // ── HỘI ĐỒNG ─────────────────────────────────────────────────
    [HttpGet("hoidong/excel")]
    [Authorize(Roles = "CTSV,HoiDong")]
    public async Task<IActionResult> HoiDongExcel([FromQuery] int? maDot, [FromQuery] string? ids = null)
    {
        try
        {
            bool isHoiDong = User.IsInRole("HoiDong");
            var allData = await _finalDecisionService.GetRecommendedProfilesAsync(isHoiDong, maDot);

            // Lọc theo ids TRƯỚC KHI tính tổng
            IEnumerable<HoSoResponseDTO> data = allData;
            if (!string.IsNullOrWhiteSpace(ids))
            {
                var idSet = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => int.TryParse(s.Trim(), out int n) ? n : -1)
                               .Where(n => n > 0).ToHashSet();
                data = allData.Where(x => idSet.Contains(x.MaHoSo));
            }

            string hocKy = ""; string namHoc = "";
            BE.Models.DotHocBong? dot = null;
            if (maDot.HasValue)
            {
                dot = await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot.Value);
                hocKy = dot?.HocKy.ToString() ?? "";
                namHoc = dot?.NamHoc ?? "";
            }

            string loai = (dot?.TrangThai == "ChinhThuc") ? "ChinhThuc" : "DeNghi";
            string sheetTitle = (loai == "ChinhThuc")
                ? (!string.IsNullOrEmpty(hocKy) ? $"DS Chính Thức HK{hocKy} {namHoc}" : "DS Chính Thức")
                : (!string.IsNullOrEmpty(hocKy) ? $"DS Đề Nghị HK{hocKy} {namHoc}" : "DS Đề Nghị");
            string fileName = !string.IsNullOrEmpty(hocKy)
                ? $"DanhSachHBKK_HK{hocKy}_{namHoc}_{loai}.xlsx"
                : $"DanhSachHBKK_{loai}_{DateTime.Now:yyyyMMdd}.xlsx";

            var stream = _export.ToExcel(MapHoSo(data), HoSoHeaders, sheetTitle);
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo Excel: " + ex.Message });
        }
    }

    [HttpGet("hoidong/pdf")]
    [Authorize(Roles = "CTSV,HoiDong")]
    public async Task<IActionResult> HoiDongPdf([FromQuery] int? maDot, [FromQuery] string? ids = null)
    {
        try
        {
            bool isHoiDong = User.IsInRole("HoiDong");
            var allData = await _finalDecisionService.GetRecommendedProfilesAsync(isHoiDong, maDot);

            // Lọc theo ids TRƯỚC KHI tính tổng
            IEnumerable<HoSoResponseDTO> data = allData;
            if (!string.IsNullOrWhiteSpace(ids))
            {
                var idSet = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => int.TryParse(s.Trim(), out int n) ? n : -1)
                               .Where(n => n > 0).ToHashSet();
                data = allData.Where(x => idSet.Contains(x.MaHoSo));
            }

            string hocKy = ""; string namHoc = "";
            BE.Models.DotHocBong? dot = null;
            if (maDot.HasValue)
            {
                dot = await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot.Value);
                hocKy = dot?.HocKy.ToString() ?? "";
                namHoc = dot?.NamHoc ?? "";
            }

            string loai = (dot?.TrangThai == "ChinhThuc") ? "ChinhThuc" : "DeNghi";
            string hkSuffix = !string.IsNullOrEmpty(hocKy) ? $" | Học Kỳ {hocKy} - {namHoc}" : "";
            string pageTitle = (loai == "ChinhThuc")
                ? $"Danh Sách Học Bổng KKHT Chính Thức{hkSuffix}"
                : $"Danh Sách Học Bổng KKHT Đề Nghị{hkSuffix}";
            string fileName = !string.IsNullOrEmpty(hocKy)
                ? $"DanhSachHBKK_HK{hocKy}_{namHoc}.pdf"
                : $"DanhSachHBKK_{loai}_{DateTime.Now:yyyyMMdd}.pdf";

            var bytes = _export.ToPdf(MapHoSo(data), HoSoHeaders, pageTitle);
            return File(bytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo PDF: " + ex.Message });
        }
    }

    // ── KHOA ─────────────────────────────────────────────────────
    [HttpGet("khoa/excel")]
    public async Task<IActionResult> KhoaExcel([FromQuery] int? maDot, [FromQuery] string? ids = null)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            
            var allData = maDot.HasValue ?
                await _khoaService.LayDanhSachChoXetTheoDotAsync(userId.Value, maDot.Value):
                await _khoaService.LayDanhSachChoDuyetAsync(userId.Value);

            // Lọc theo ids TRƯỚC KHI tính tổng
            var data = allData.Where(x => !string.IsNullOrWhiteSpace(x.XepLoaiHB)).ToList();
            if (!string.IsNullOrWhiteSpace(ids))
            {
                var idSet = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => int.TryParse(s.Trim(), out int n) ? n : -1)
                               .Where(n => n > 0).ToHashSet();
                data = data.Where(x => idSet.Contains(x.MaHoSo)).ToList();
            }

            string hocKy = ""; string namHoc = "";
            BE.Models.DotHocBong? dot = null;
            if (maDot.HasValue)
            {
                dot = await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot.Value);
                hocKy = dot?.HocKy.ToString() ?? "";
                namHoc = dot?.NamHoc ?? "";
            }

            int stt = 1;
            decimal tongTien = 0;
            var rows = data.Select(x =>
            {
                if (x.MucHocBong.HasValue) tongTien += x.MucHocBong.Value;
                return new Dictionary<string, string>
                {
                    ["STT"]         = (stt++).ToString(),
                    ["Mã SV"]       = x.MaSV ?? "",
                    ["Họ Tên"]      = x.HoTenSinhVien ?? "",
                    ["Lớp"]         = x.TenLop ?? "",
                    ["GPA"]         = x.GPA.ToString("F2"),
                    ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
                    ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
                    ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
                    ["Mức Học Bổng"]= x.MucHocBong.HasValue ? x.MucHocBong.Value.ToString("N0") + " đ" : "",
                };
            }).ToList();

            // Dòng tổng cộng
            rows.Add(new Dictionary<string, string>
            {
                ["STT"] = "", ["Mã SV"] = "", ["Họ Tên"] = "", ["Lớp"] = "",
                ["GPA"] = "", ["Điểm HT"] = "", ["Điểm RL"] = "",
                ["Xếp Loại HB"] = "TỔNG CỘNG:",
                ["Mức Học Bổng"] = tongTien.ToString("N0") + " đ"
            });
            
            var headers = new List<string> { "STT", "Mã SV", "Họ Tên", "Lớp", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Mức Học Bổng" };
            string loai = (dot?.TrangThai == "ChinhThuc") ? "ChinhThuc" : "DeNghi";
            string sheetTitle = !string.IsNullOrEmpty(hocKy)
                ? $"DS Khoa HK{hocKy} {namHoc}"
                : "DS Khoa Đề Nghị";
            string fileName = !string.IsNullOrEmpty(hocKy)
                ? $"DanhSachHBKK_HK{hocKy}_{namHoc}.xlsx"
                : $"DanhSachHBKK_Khoa_{DateTime.Now:yyyyMMdd}.xlsx";
            string hkSuffix = !string.IsNullOrEmpty(hocKy) ? $" | Học Kỳ {hocKy} - {namHoc}" : "";
            string pageTitle = $"Danh Sách Học Bổng KKHT{hkSuffix}";

            var stream = _export.ToExcel(rows, headers, sheetTitle, pageTitle);
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo Excel: " + ex.Message });
        }
    }

    [HttpGet("khoa/pdf")]
    public async Task<IActionResult> KhoaPdf([FromQuery] int? maDot, [FromQuery] string? ids = null)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            
            var allData = maDot.HasValue ?
                await _khoaService.LayDanhSachChoXetTheoDotAsync(userId.Value, maDot.Value):
                await _khoaService.LayDanhSachChoDuyetAsync(userId.Value);

            // Lọc theo ids TRƯỚC KHI tính tổng
            var data = allData.Where(x => !string.IsNullOrWhiteSpace(x.XepLoaiHB)).ToList();
            if (!string.IsNullOrWhiteSpace(ids))
            {
                var idSet = ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => int.TryParse(s.Trim(), out int n) ? n : -1)
                               .Where(n => n > 0).ToHashSet();
                data = data.Where(x => idSet.Contains(x.MaHoSo)).ToList();
            }

            string hocKy = ""; string namHoc = "";
            BE.Models.DotHocBong? dot = null;
            if (maDot.HasValue)
            {
                dot = await _context.DotHocBongs.FirstOrDefaultAsync(d => d.MaDot == maDot.Value);
                hocKy = dot?.HocKy.ToString() ?? "";
                namHoc = dot?.NamHoc ?? "";
            }

            int stt = 1;
            decimal tongTien = 0;
            var rows = data.Select(x =>
            {
                if (x.MucHocBong.HasValue) tongTien += x.MucHocBong.Value;
                return new Dictionary<string, string>
                {
                    ["STT"]         = (stt++).ToString(),
                    ["Mã SV"]       = x.MaSV ?? "",
                    ["Họ Tên"]      = x.HoTenSinhVien ?? "",
                    ["Lớp"]         = x.TenLop ?? "",
                    ["GPA"]         = x.GPA.ToString("F2"),
                    ["Điểm HT"]     = x.DiemHocTap.ToString("F2"),
                    ["Điểm RL"]     = x.DiemRenLuyen.ToString("F2"),
                    ["Xếp Loại HB"] = x.XepLoaiHB ?? "",
                    ["Mức Học Bổng"]= x.MucHocBong.HasValue ? x.MucHocBong.Value.ToString("N0") + " đ" : "",
                };
            }).ToList();

            rows.Add(new Dictionary<string, string>
            {
                ["STT"] = "", ["Mã SV"] = "", ["Họ Tên"] = "", ["Lớp"] = "",
                ["GPA"] = "", ["Điểm HT"] = "", ["Điểm RL"] = "",
                ["Xếp Loại HB"] = "TỔNG CỘNG:",
                ["Mức Học Bổng"] = tongTien.ToString("N0") + " đ"
            });
            
            var headers = new List<string> { "STT", "Mã SV", "Họ Tên", "Lớp", "GPA", "Điểm HT", "Điểm RL", "Xếp Loại HB", "Mức Học Bổng" };
            string hkSuffix = !string.IsNullOrEmpty(hocKy) ? $" | Học Kỳ {hocKy} - {namHoc}" : "";
            string pageTitle = $"Danh Sách Học Bổng KKHT — Khoa Đề Nghị{hkSuffix}";
            string pdfFileName = !string.IsNullOrEmpty(hocKy)
                ? $"DanhSachHBKK_HK{hocKy}_{namHoc}.pdf"
                : $"DanhSachHBKK_Khoa_{DateTime.Now:yyyyMMdd}.pdf";

            var bytes = _export.ToPdf(rows, headers, pageTitle);
            return File(bytes, "application/pdf", pdfFileName);
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

            decimal totalSum = (data ?? new()).Sum(x => x.KinhPhi);
            rows.Add(new Dictionary<string, string>
            {
                ["Mã Phân Bổ"]      = "Tổng cộng",
                ["Mã Đợt"]          = "",
                ["Mã Khoa"]         = "",
                ["Kinh Phí"]        = totalSum.ToString("N0"),
                ["Mức HB Loại Khá"] = ""
            });
            
            var headers = new List<string> { "Mã Phân Bổ", "Mã Đợt", "Mã Khoa", "Kinh Phí", "Mức HB Loại Khá" };
            var stream = _export.ToExcel(rows, headers, "Kinh Phí");
            
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
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

            decimal totalSum = (data ?? new()).Sum(x => x.KinhPhi);
            rows.Add(new Dictionary<string, string>
            {
                ["Mã Phân Bổ"]      = "Tổng cộng",
                ["Mã Đợt"]          = "",
                ["Mã Khoa"]         = "",
                ["Kinh Phí"]        = totalSum.ToString("N0"),
                ["Mức HB Loại Khá"] = ""
            });
            
            var headers = new List<string> { "Mã Phân Bổ", "Mã Đợt", "Mã Khoa", "Kinh Phí", "Mức HB Loại Khá" };
            var bytes = _export.ToPdf(rows, headers, $"Phân Bổ Kinh Phí — Đợt {maDot}");
            return File(bytes, "application/pdf", $"TaiChinh_KinhPhi_{maDot}_{DateTime.Now:yyyyMMdd}.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi tạo PDF: " + ex.Message });
        }
    }
}