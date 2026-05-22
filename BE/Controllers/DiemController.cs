using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/diem")]
public class DiemController : ControllerBase
{
    private readonly IDiemService _diemService;
    private readonly ILogger<DiemController> _logger;

    public DiemController(IDiemService diemService, ILogger<DiemController> logger)
    {
        _diemService = diemService;
        _logger = logger;
    }

    [HttpPost("import-du-lieu-hoc-vu")]
    [Authorize(Roles = "DaoTao")]
    public async Task<IActionResult> ImportDuLieuHocVu([FromBody] List<ImportHocVuRequest> requests)
    {
        if (requests == null)
        {
            return BadRequest(new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Du lieu import hoc vu khong hop le",
                Data = null
            });
        }

        try
        {
            var result = await _diemService.ImportDuLieuHocVuAsync(requests);
            return Ok(new BaseResponse<ImportResultDTO>
            {
                Success = true,
                Message = "Import du lieu hoc vu thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ImportDuLieuHocVu failed.");
            return StatusCode(500, new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    [HttpGet("danh-sach-hoc-vu")]
    [Authorize(Roles = "DaoTao")]
    public async Task<IActionResult> GetDanhSachHocVu([FromQuery] int? hocKy, [FromQuery] string? namHoc)
    {
        try
        {
            var result = await _diemService.GetDanhSachHocVuAsync(hocKy, namHoc);
            return Ok(new BaseResponse<IEnumerable<DuLieuHocVuResponseDTO>>
            {
                Success = true,
                Message = "Lay danh sach du lieu hoc vu thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDanhSachHocVu failed.");
            return StatusCode(500, new BaseResponse<IEnumerable<DuLieuHocVuResponseDTO>>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }
}
