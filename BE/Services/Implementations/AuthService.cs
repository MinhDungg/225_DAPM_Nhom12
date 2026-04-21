using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BE.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly ITaiKhoanRepository _taiKhoanRepository;
    private readonly IConfiguration _configuration;

    public AuthService(ITaiKhoanRepository taiKhoanRepository, IConfiguration configuration)
    {
        _taiKhoanRepository = taiKhoanRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponseDTO?> AuthenticateAsync(LoginRequestDTO request)
    {
        var taiKhoan = await _taiKhoanRepository.LayTheoTenDangNhapAsync(request.Username);
        if (taiKhoan == null)
        {
            return null;
        }

        if (!taiKhoan.TrangThai)
        {
            return null;
        }

        if (!KiemTraMatKhau(request.Password, taiKhoan.MatKhau))
        {
            return null;
        }

        var token = TaoJwtToken(taiKhoan);
        var userInfo = new LoginUserInfoDTO
        {
            Id = taiKhoan.MaTK,
            Name = LayTenHienThi(taiKhoan)
        };

        return new LoginResponseDTO
        {
            Token = token,
            Role = taiKhoan.VaiTro,
            UserInfo = userInfo
        };
    }

    private string LayTenHienThi(TaiKhoan taiKhoan)
    {
        if (taiKhoan.SinhVien != null)
        {
            return taiKhoan.SinhVien.HoTen;
        }

        if (taiKhoan.CanBo != null)
        {
            return taiKhoan.CanBo.HoTen;
        }

        return taiKhoan.TenDangNhap;
    }

    private bool KiemTraMatKhau(string matKhauNhap, string matKhauLuu)
    {
        if (string.Equals(matKhauNhap, matKhauLuu, StringComparison.Ordinal))
        {
            return true;
        }

        var maHoa = TinhSha256(matKhauNhap);
        return string.Equals(maHoa, matKhauLuu, StringComparison.OrdinalIgnoreCase);
    }

    private static string TinhSha256(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private string TaoJwtToken(TaiKhoan taiKhoan)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var key = jwtSection["Key"] ?? string.Empty;
        var issuer = jwtSection["Issuer"] ?? string.Empty;
        var audience = jwtSection["Audience"] ?? string.Empty;
        var expireMinutes = int.TryParse(jwtSection["ExpireMinutes"], out var minutes)
            ? minutes
            : 60;

        var claims = new List<Claim>
        {
            new("UserId", taiKhoan.MaTK.ToString()),
            new(ClaimTypes.Role, taiKhoan.VaiTro),
            new(ClaimTypes.Name, taiKhoan.TenDangNhap)
        };

        // Bổ sung claim MaSV hoặc MaCB tùy theo vai trò
        if (taiKhoan.SinhVien != null)
        {
            claims.Add(new Claim("MaSV", taiKhoan.SinhVien.MaSV));
        }
        if (taiKhoan.CanBo != null)
        {
            claims.Add(new Claim("MaCB", taiKhoan.CanBo.MaCB.ToString()));
        }

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
