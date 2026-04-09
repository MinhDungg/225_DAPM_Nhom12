using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDTO?> AuthenticateAsync(LoginRequestDTO request);
}
