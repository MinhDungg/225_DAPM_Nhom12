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

    [HttpPost("import-gpa")]
    [Authorize(Roles = "DaoTao")]
    public async Task<IActionResult> ImportGpa([FromBody] List<ImportGpaRequest> requests)
    {
        if (requests == null)
        {
            return BadRequest(new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Du lieu import GPA khong hop le",
                Data = null
            });
        }

        try
        {
            var result = await _diemService.ImportGpaAsync(requests);
            return Ok(new BaseResponse<ImportResultDTO>
            {
                Success = true,
                Message = "Import GPA thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ImportGpa failed.");
            return StatusCode(500, new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }

    [HttpPost("import-drl")]
    [Authorize(Roles = "CTSV")]
    public async Task<IActionResult> ImportDrl([FromBody] List<ImportDrlRequest> requests)
    {
        if (requests == null)
        {
            return BadRequest(new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Du lieu import DRL khong hop le",
                Data = null
            });
        }

        try
        {
            var result = await _diemService.ImportDrlAsync(requests);
            return Ok(new BaseResponse<ImportResultDTO>
            {
                Success = true,
                Message = "Import DRL thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ImportDrl failed.");
            return StatusCode(500, new BaseResponse<ImportResultDTO>
            {
                Success = false,
                Message = "Loi he thong",
                Data = null
            });
        }
    }
}

