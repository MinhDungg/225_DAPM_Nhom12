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
}
