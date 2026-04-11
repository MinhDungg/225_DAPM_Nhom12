using System.Security.Claims;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/khoa")]
[Authorize]
public class KhoaController : ControllerBase
{
    private readonly IKhoaService _khoaService;

    public KhoaController(IKhoaService khoaService)
    {
        _khoaService = khoaService;
    }

    [HttpGet("danhsach")]
    public async Task<IActionResult> GetDanhSachChoDuyet()
    {
        // Debug: In ra tất cả claims
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        
        // Thử nhiều cách lấy UserId
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = "Khong tim thay UserId trong token",
                Data = new { AllClaims = claims } // Trả về tất cả claims để debug
            });
        }

        var result = await _khoaService.LayDanhSachChoDuyetAsync(userId);

        return Ok(new BaseResponse<List<HoSoChoDuyetResponseDTO>>
        {
            Success = true,
            Message = "Lay danh sach thanh cong",
            Data = result
        });
    }
}
