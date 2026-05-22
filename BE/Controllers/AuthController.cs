using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new BaseResponse<LoginResponseDTO>
            {
                Success = false,
                Message = "Du lieu dang nhap khong hop le",
                Data = null
            });
        }

        var result = await _authService.AuthenticateAsync(request);
        if (result == null)
        {
            return Unauthorized(new BaseResponse<LoginResponseDTO>
            {
                Success = false,
                Message = "Dang nhap that bai",
                Data = null
            });
        }

        return Ok(new BaseResponse<LoginResponseDTO>
        {
            Success = true,
            Message = "Dang nhap thanh cong",
            Data = result
        });
    }
}
