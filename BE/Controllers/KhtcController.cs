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

    /// <summary>
    /// POST /api/khtc/thiet-lap-kinh-phi-bulk — Thiết lập kinh phí cho nhiều Khoa cùng lúc.
    /// </summary>
    [HttpPost("thiet-lap-kinh-phi-bulk")]
    [Authorize(Roles = "KHTC")]
    public async Task<IActionResult> ThietLapKinhPhiBulk([FromBody] List<ThietLapKinhPhiRequest> requests)
    {
        if (requests == null || requests.Count == 0)
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = "Danh sach kinh phi khong duoc de trong",
                Data = null
            });
        }

        try
        {
            var results = new List<PhanBoKinhPhiResponseDTO>();
            foreach (var req in requests)
            {
                var result = await _kinhPhiService.ThietLapKinhPhiAsync(req);
                if (result != null) results.Add(result);
            }

            return Ok(new BaseResponse<List<PhanBoKinhPhiResponseDTO>>
            {
                Success = true,
                Message = $"Thiet lap kinh phi thanh cong cho {results.Count} khoa",
                Data = results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ThietLapKinhPhiBulk failed.");
            return StatusCode(500, new BaseResponse<object>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    /// <summary>
    /// GET /api/khtc/phan-bo/{maDot} — Lấy danh sách phân bổ kinh phí đã lưu của một đợt.
    /// </summary>
    [HttpGet("phan-bo/{maDot:int}")]
    [Authorize(Roles = "KHTC,CTSV")]
    public async Task<IActionResult> GetPhanBo([FromRoute] int maDot)
    {
        try
        {
            var result = await _kinhPhiService.LayPhanBoTheoMaDotAsync(maDot);
            return Ok(new BaseResponse<List<PhanBoKinhPhiResponseDTO>>
            {
                Success = true,
                Message = $"Lay phan bo kinh phi thanh cong. So luong: {result.Count}",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetPhanBo failed. MaDot={MaDot}", maDot);
            return StatusCode(500, new BaseResponse<List<PhanBoKinhPhiResponseDTO>>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }
}

