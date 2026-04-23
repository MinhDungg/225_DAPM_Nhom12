using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/dothocbong")]
public class DotHocBongController : ControllerBase
{
    private readonly IDotHocBongService _dotHocBongService;
    private readonly ILogger<DotHocBongController> _logger;

    public DotHocBongController(IDotHocBongService dotHocBongService, ILogger<DotHocBongController> logger)
    {
        _dotHocBongService = dotHocBongService;
        _logger = logger;
    }

    // ── POST /api/dothocbong ─────────────────────────────────────────────────
    [HttpPost]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> Create([FromBody] DotHocBongCreateDTO request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.LoaiDot) || string.IsNullOrWhiteSpace(request.NamHoc))
        {
            return BadRequest(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = "Du lieu dot hoc bong khong hop le",
                Data = null
            });
        }

        try
        {
            var created = await _dotHocBongService.CreateDotHocBongAsync(request);
            return Ok(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = true,
                Message = "Tao dot hoc bong thanh cong",
                Data = created
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create DotHocBong failed.");
            return StatusCode(500, new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    // ── GET /api/dothocbong ──────────────────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "CTSV,HoiDong,HieuTruong,Khoa,DaoTao,KHTC")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await _dotHocBongService.GetAllDotHocBongAsync();
            return Ok(new BaseResponse<IEnumerable<DotHocBongResponseDTO>>
            {
                Success = true,
                Message = "Lay danh sach dot hoc bong thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetAll DotHocBong failed.");
            return StatusCode(500, new BaseResponse<IEnumerable<DotHocBongResponseDTO>>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    // ── PUT /api/dothocbong/{id} ─────────────────────────────────────────────
    [HttpPut("{maDot:int}")]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> Update([FromRoute] int maDot, [FromBody] DotHocBongUpdateDTO request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.LoaiDot) || string.IsNullOrWhiteSpace(request.NamHoc))
        {
            return BadRequest(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = "Du lieu cap nhat khong hop le",
                Data = null
            });
        }

        try
        {
            var updated = await _dotHocBongService.UpdateDotHocBongAsync(maDot, request);
            if (updated == null)
            {
                return NotFound(new BaseResponse<DotHocBongResponseDTO>
                {
                    Success = false,
                    Message = "Khong tim thay dot hoc bong",
                    Data = null
                });
            }

            return Ok(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = true,
                Message = "Cap nhat dot hoc bong thanh cong",
                Data = updated
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update DotHocBong failed. MaDot={MaDot}", maDot);
            return StatusCode(500, new BaseResponse<DotHocBongResponseDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    // ── DELETE /api/dothocbong/{id} ──────────────────────────────────────────
    [HttpDelete("{maDot:int}")]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> Delete([FromRoute] int maDot)
    {
        try
        {
            var deleted = await _dotHocBongService.DeleteDotHocBongAsync(maDot);
            if (!deleted)
            {
                return NotFound(new BaseResponse<object>
                {
                    Success = false,
                    Message = "Khong tim thay dot hoc bong",
                    Data = null
                });
            }

            return Ok(new BaseResponse<object>
            {
                Success = true,
                Message = "Xoa dot hoc bong thanh cong",
                Data = null
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete DotHocBong failed. MaDot={MaDot}", maDot);
            return StatusCode(500, new BaseResponse<object>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    // ── POST /api/dothocbong/{id}/tu-dong-quet ───────────────────────────────
    [HttpPost("{maDot:int}/tu-dong-quet")]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> TuDongQuet([FromRoute] int maDot)
    {
        try
        {
            var result = await _dotHocBongService.AutoScanCandidatesAsync(maDot);
            if (result == null)
            {
                return BadRequest(new BaseResponse<AutoScanResultDTO>
                {
                    Success = false,
                    Message = "Dot hoc bong khong ton tai",
                    Data = null
                });
            }

            return Ok(new BaseResponse<AutoScanResultDTO>
            {
                Success = true,
                Message = "Tu dong quet thanh cong",
                Data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new BaseResponse<AutoScanResultDTO>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TuDongQuet failed. MaDot={MaDot}", maDot);
            return StatusCode(500, new BaseResponse<AutoScanResultDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    // ── GET /api/dothocbong/{id}/danh-sach-ung-vien ─────────────────────────
    [HttpGet("{maDot:int}/danh-sach-ung-vien")]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> GetDanhSachUngVien([FromRoute] int maDot)
    {
        try
        {
            var result = await _dotHocBongService.GetDanhSachUngVienAsync(maDot);
            return Ok(new BaseResponse<List<UngVienResponseDTO>>
            {
                Success = true,
                Message = $"Lay danh sach ung vien thanh cong. So luong: {result.Count}",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDanhSachUngVien failed. MaDot={MaDot}", maDot);
            return StatusCode(500, new BaseResponse<List<UngVienResponseDTO>>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }
}
