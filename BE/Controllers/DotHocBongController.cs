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

    public DotHocBongController(IDotHocBongService dotHocBongService)
    {
        _dotHocBongService = dotHocBongService;
    }

    [HttpPost]
    [Authorize]
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

        var created = await _dotHocBongService.CreateDotHocBongAsync(request);

        return Ok(new BaseResponse<DotHocBongResponseDTO>
        {
            Success = true,
            Message = "Tao dot hoc bong thanh cong",
            Data = created
        });
    }
}
