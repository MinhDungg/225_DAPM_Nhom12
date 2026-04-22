using System.Security.Claims;
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
    [Authorize(Roles = "CTSV,Khoa,Admin")]
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