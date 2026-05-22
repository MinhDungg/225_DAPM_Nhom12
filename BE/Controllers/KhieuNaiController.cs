using System.Security.Claims;
using System.IO;
using Microsoft.AspNetCore.Http;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace BE.Controllers;

[Route("api/[controller]")]
[ApiController]
public class KhieuNaiController : ControllerBase
{
    private readonly IKhieuNaiService _khieuNaiService;

    public KhieuNaiController(IKhieuNaiService khieuNaiService)
    {
        _khieuNaiService = khieuNaiService;
    }

    [HttpPost("upload-minh-chung")]
    [Authorize]
    public async Task<IActionResult> UploadMinhChung(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new BaseResponse<object> { Success = false, Message = "Không nhận được tệp tải lên." });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new BaseResponse<object> { Success = false, Message = "Định dạng tệp không được hỗ trợ. Chỉ nhận JPG, JPEG, PNG, PDF, DOC, DOCX." });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new BaseResponse<object> { Success = false, Message = "Dung lượng tệp vượt quá giới hạn cho phép (Tối đa 5MB)." });
        }

        try
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/{uniqueFileName}";
            return Ok(new BaseResponse<string>
            {
                Success = true,
                Message = "Tải minh chứng lên thành công.",
                Data = relativePath
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new BaseResponse<object> { Success = false, Message = $"Lỗi hệ thống khi lưu tệp: {ex.Message}" });
        }
    }

    // ==========================================
    // DÀNH CHO SINH VIÊN
    // ==========================================

    [HttpPost("gui-khieu-nai")]
    [Authorize(Roles = "SinhVien")]
    public async Task<IActionResult> GuiKhieuNai([FromBody] TaoKhieuNaiRequestDTO request)
    {
        // Lấy MaSV từ custom claim "MaSV" đã thêm khi tạo JWT
        var maSV = User.FindFirst("MaSV")?.Value;
        if (string.IsNullOrEmpty(maSV)) return Unauthorized(new BaseResponse<object> { Success = false, Message = "Không xác định được mã sinh viên." });

        var response = await _khieuNaiService.TaoKhieuNaiAsync(maSV, request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("sinh-vien")]
    [Authorize(Roles = "SinhVien")]
    public async Task<IActionResult> GetKhieuNaiCuaToi()
    {
        var maSV = User.FindFirst("MaSV")?.Value;
        if (string.IsNullOrEmpty(maSV)) return Unauthorized(new BaseResponse<object> { Success = false, Message = "Không xác định được mã sinh viên." });

        var response = await _khieuNaiService.LaysDSKhieuNaiCuaSinhVienAsync(maSV);
        return Ok(response);
    }

    // ==========================================
    // DÀNH CHO CÁN BỘ / PHÒNG BAN (XỬ LÝ)
    // ==========================================

    [HttpGet("tat-ca")]
    [Authorize(Roles = "CTSV,Khoa,HoiDong,Admin")]
    public async Task<IActionResult> GetAllKhieuNai()
    {
        var response = await _khieuNaiService.LayTatCaKhieuNaiAsync();
        return Ok(response);
    }

    [HttpPut("{id}/phan-hoi")]
    [Authorize(Roles = "CTSV,Khoa,Admin")]
    public async Task<IActionResult> PhanHoiKhieuNai(int id, [FromBody] PhanHoiKhieuNaiRequestDTO request)
    {
        // Lấy MaCB từ custom claim "MaCB" đã thêm khi tạo JWT
        var maCBStr = User.FindFirst("MaCB")?.Value;
        if (!int.TryParse(maCBStr, out int maCB))
        {
            return Unauthorized(new BaseResponse<object> { Success = false, Message = "Không xác định được danh tính cán bộ duyệt." });
        }

        var response = await _khieuNaiService.PhanHoiKhieuNaiAsync(id, maCB, request);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}