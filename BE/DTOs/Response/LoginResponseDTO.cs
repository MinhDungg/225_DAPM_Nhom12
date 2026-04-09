namespace BE.DTOs.Response;

public class LoginResponseDTO
{
    public string Token { get; set; } = null!;
    public string Role { get; set; } = null!;
    public LoginUserInfoDTO UserInfo { get; set; } = null!;
}
