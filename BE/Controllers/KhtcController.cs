using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/khtc")]
public class KhtcController : ControllerBase
{
    private readonly IKinhPhiService _kinhPhiService;
    private readonly ILogger<KhtcController> _logger;

    public KhtcController(IKinhPhiService kinhPhiService, ILogger<KhtcController> logger)
    {
        _kinhPhiService = kinhPhiService;
        _logger = logger;
    }

    [HttpPost("thiet-lap-kinh-phi")]
    [Authorize(Roles = "KHTC")]
    public async Task<IActionResult> ThietLapKinhPhi([FromBody] ThietLapKinhPhiRequest request)
    {
        if (request == null)
        {
            return BadRequest(new BaseResponse<PhanBoKinhPhiResponseDTO>
            {
                Success = false,
                Message = "Du lieu thiet lap kinh phi khong hop le",
                Data = null
            });
        }

        try
        {
            var result = await _kinhPhiService.ThietLapKinhPhiAsync(request);
            if (result == null)
            {
                return BadRequest(new BaseResponse<PhanBoKinhPhiResponseDTO>
                {
                    Success = false,
                    Message = "MaDot hoac MaKhoa khong ton tai",
                    Data = null
                });
            }

            return Ok(new BaseResponse<PhanBoKinhPhiResponseDTO>
            {
                Success = true,
                Message = "Thiet lap kinh phi thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ThietLapKinhPhi failed.");
            return StatusCode(500, new BaseResponse<PhanBoKinhPhiResponseDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }
}

