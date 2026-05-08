using System.Security.Claims;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Repositories.Interfaces;
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
    private readonly IKhoaRepository _khoaRepository;

    public KhoaController(IKhoaService khoaService, IKhoaRepository khoaRepository)
    {
        _khoaService = khoaService;
        _khoaRepository = khoaRepository;
    }

    /// <summary>
    /// GET /api/khoa — Lấy danh sách tất cả Khoa (dùng cho KHTC, CTSV, DaoTao).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var danhSach = await _khoaRepository.LayTatCaAsync();
        var result = danhSach.Select(k => new { maKhoa = k.MaKhoa, tenKhoa = k.TenKhoa }).ToList();
        return Ok(new BaseResponse<object>
        {
            Success = true,
            Message = "Lay danh sach khoa thanh cong",
            Data = result
        });
    }

    [HttpGet("danhsach")]
    public async Task<IActionResult> GetDanhSachChoDuyet()
    {
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = "Khong tim thay UserId trong token",
                Data = null
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

    [HttpGet("danhsach/{maDot:int}")]
    public async Task<IActionResult> GetDanhSachChoXetTheoDot(int maDot)
    {
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = "Khong tim thay UserId trong token",
                Data = null
            });
        }

        var result = await _khoaService.LayDanhSachChoXetTheoDotAsync(userId, maDot);

        return Ok(new BaseResponse<List<HoSoChoDuyetResponseDTO>>
        {
            Success = true,
            Message = "Lay danh sach cho xet theo dot thanh cong",
            Data = result
        });
    }

    [HttpGet("danhsach-da-de-xuat")]
    public async Task<IActionResult> GetDanhSachDaDeXuat()
    {
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return BadRequest(new BaseResponse<object>
            {
                Success = false,
                Message = "Khong tim thay UserId trong token",
                Data = null
            });
        }

        var result = await _khoaService.LayDanhSachDaDeXuatAsync(userId);

        return Ok(new BaseResponse<List<HoSoChoDuyetResponseDTO>>
        {
            Success = true,
            Message = "Lay danh sach da de xuat thanh cong",
            Data = result
        });
    }

    [HttpGet("phan-bo/{maDot:int}")]
    public async Task<IActionResult> GetPhanBoKinhPhi(int maDot)
    {
        var userIdClaim = User.FindFirst("UserId")
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new BaseResponse<PhanBoKinhPhiResponseDTO>
            {
                Success = false,
                Message = "Khong tim thay thong tin nguoi dung",
                Data = null
            });
        }

        var result = await _khoaService.LayPhanBoKinhPhiAsync(userId, maDot);
        return Ok(new BaseResponse<PhanBoKinhPhiResponseDTO?>
        {
            Success = true,
            Message = result == null ? "Chua co kinh phi cho khoa trong dot nay" : "Lay kinh phi thanh cong",
            Data = result
        });
    }

    [HttpPost("xephang")]
    public async Task<IActionResult> XepHang([FromBody] XepHangRequestDTO request)
    {
        // Validate request
        if (request == null || request.MaDot <= 0)
        {
            return BadRequest(new BaseResponse<XepHangResponseDTO>
            {
                Success = false,
                Message = "Du lieu khong hop le. MaDot phai lon hon 0",
                Data = null
            });
        }

        // Lấy UserId từ JWT token
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new BaseResponse<XepHangResponseDTO>
            {
                Success = false,
                Message = "Khong tim thay thong tin nguoi dung",
                Data = null
            });
        }

        try
        {
            var result = await _khoaService.XepHangVaPhanBoAsync(userId, request);

            return Ok(new BaseResponse<XepHangResponseDTO>
            {
                Success = true,
                Message = "Xep hang va phan bo thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new BaseResponse<XepHangResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
    }

    [HttpPut("dexuat")]
    public async Task<IActionResult> ChotDanhSachDeXuat([FromBody] ChotDeXuatRequestDTO request)
    {
        // Validate request
        if (request == null || request.MaDot <= 0 || request.DanhSachMaHoSo == null || !request.DanhSachMaHoSo.Any())
        {
            return BadRequest(new BaseResponse<ChotDeXuatResponseDTO>
            {
                Success = false,
                Message = "Du lieu khong hop le. MaDot phai lon hon 0 va danh sach ho so khong duoc rong",
                Data = null
            });
        }

        // Lấy UserId từ JWT token
        var userIdClaim = User.FindFirst("UserId") 
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub");
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new BaseResponse<ChotDeXuatResponseDTO>
            {
                Success = false,
                Message = "Khong tim thay thong tin nguoi dung",
                Data = null
            });
        }

        try
        {
            var result = await _khoaService.ChotDanhSachDeXuatAsync(userId, request);

            return Ok(new BaseResponse<ChotDeXuatResponseDTO>
            {
                Success = true,
                Message = "Chot danh sach de xuat thanh cong",
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new BaseResponse<ChotDeXuatResponseDTO>
            {
                Success = false,
                Message = ex.Message,
                Data = null
            });
        }
    }
}
