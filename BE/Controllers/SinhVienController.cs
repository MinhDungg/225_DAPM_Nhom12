using BE.DTOs.Response;
using BE.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE.Controllers;

[ApiController]
[Route("api/sinhvien")]
public class SinhVienController : ControllerBase
{
    private readonly ISinhVienRepository _sinhVienRepository;
    private readonly ILogger<SinhVienController> _logger;

    public SinhVienController(
        ISinhVienRepository sinhVienRepository,
        ILogger<SinhVienController> logger)
    {
        _sinhVienRepository = sinhVienRepository;
        _logger = logger;
    }

    /// <summary>
    /// Xác thực danh sách mã sinh viên và trả về Họ tên tương ứng.
    /// POST /api/sinhvien/verify-list
    /// Body: ["SV001", "SV002", ...]
    /// </summary>
    [HttpPost("verify-list")]
    [Authorize(Roles = "DaoTao")]
    public async Task<IActionResult> VerifyList([FromBody] List<string> maSVs)
    {
        if (maSVs == null || maSVs.Count == 0)
        {
            return BadRequest(new BaseResponse<List<SinhVienVerifyResponseDTO>>
            {
                Success = false,
                Message = "Danh sach ma sinh vien khong duoc de trong.",
                Data = null
            });
        }

        try
        {
            _logger.LogInformation("VerifyList start. Count={Count}", maSVs.Count);

            var danhSach = await _sinhVienRepository.LayDanhSachTheoMaSVAsync(maSVs);

            var result = danhSach
                .Select(x => new SinhVienVerifyResponseDTO
                {
                    MaSV = x.MaSV,
                    HoTen = x.HoTen
                })
                .ToList();

            _logger.LogInformation("VerifyList done. Found={Found}", result.Count);

            return Ok(new BaseResponse<List<SinhVienVerifyResponseDTO>>
            {
                Success = true,
                Message = $"Tim thay {result.Count} sinh vien hop le.",
                Data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "VerifyList failed.");
            return StatusCode(500, new BaseResponse<List<SinhVienVerifyResponseDTO>>
            {
                Success = false,
                Message = "Loi he thong.",
                Data = null
            });
        }
    }
}
