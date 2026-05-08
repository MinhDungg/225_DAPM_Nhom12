using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BE.DTOs.Response; 
using BE.Services.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/tructhuoc")]
    public class FinalDecisionController : ControllerBase
    {
        private readonly IFinalDecisionService _service;

        public FinalDecisionController(IFinalDecisionService service)
        {
            _service = service;
        }

        [HttpGet("/api/ctsv/tonghop")]
        [Authorize(Roles = "CTSV,HoiDong")]
        public async Task<ActionResult<BaseResponse<IEnumerable<HoSoResponseDTO>>>> GetSystemWideSummaryAsync([FromQuery] int? maDot = null)
        {
            // Lấy thông tin từ Token xem người đăng nhập có phải là Hội Đồng không
            bool isHoiDong = User.IsInRole("HoiDong");

            // Truyền kết quả xuống cho Service xử lý
            var profiles = await _service.GetRecommendedProfilesAsync(isHoiDong, maDot);

            return Ok(new BaseResponse<IEnumerable<HoSoResponseDTO>>
            {
                Success = true,
                Message = "Lấy danh sách tổng hợp thành công.",
                Data = profiles
            });
        }

        [HttpPut("/api/hoidong/xetchon")]
        [Authorize(Roles = "HoiDong")]
        public async Task<ActionResult<BaseResponse<bool>>> SelectProfilesAsync([FromBody] List<int> profileIds)
        {
            var result = await _service.ApproveExpectedListAsync(profileIds);

            return Ok(new BaseResponse<bool>
            {
                Success = result,
                Message = result ? "Cập nhật hồ sơ thành HoiDongDuyet thành công." : "Không có hồ sơ nào được cập nhật.",
                Data = result
            });
        }
    
    [HttpGet("/api/sinhvien/tracuu")]
        [Authorize(Roles = "SinhVien")]
        public async Task<ActionResult<BaseResponse<IEnumerable<HoSoResponseDTO>>>> GetMyProgress()
        {
            // Lấy MaSV từ Claim NameIdentifier (thường được lưu khi Login)
            var maSV = User.Identity?.Name;
            if (string.IsNullOrEmpty(maSV)) return Unauthorized();

            var result = await _service.GetStudentProgressAsync(maSV);
            return Ok(new BaseResponse<IEnumerable<HoSoResponseDTO>>
            {
                Success = true,
                Data = result
            });
        }

        [HttpPut("/api/ctsv/trinh-hieu-truong/{maDot}")]
        [Authorize(Roles = "CTSV")]
        public async Task<ActionResult<BaseResponse<bool>>> CTSVTrinhHieuTruong(int maDot)
        {
            // Gọi logic xử lý chuyển trạng thái đợt sang 'ChoPheDuyet'
            var result = await _service.CTSVTrinhHieuTruongAsync(maDot);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }


        [HttpGet("/api/hieutruong/tong-hop/{maDot}")]
        [Authorize(Roles = "HieuTruong,CTSV")] // Mở quyền cho cả CTSV
        public async Task<ActionResult<BaseResponse<TongHopHieuTruongResponseDTO>>> GetToTrinh(int maDot)
        {
            // Kiểm tra xem user đang gọi API có phải là Hiệu Trưởng không
            bool isHieuTruong = User.IsInRole("HieuTruong");

            // Truyền biến isHieuTruong xuống service
            var result = await _service.GetToTrinhHieuTruongAsync(maDot, isHieuTruong);

            if (result == null)
            {
                return Ok(new BaseResponse<TongHopHieuTruongResponseDTO>
                {
                    Success = false,
                    Message = "Danh sách hiện tại đang được phòng CTSV rà soát, chưa trình lên Ban Giám Hiệu."
                });
            }

            return Ok(new BaseResponse<TongHopHieuTruongResponseDTO> { Success = true, Data = result });
        }

        // Task 3.4: Hiệu trưởng phê duyệt
        [HttpPut("/api/hieutruong/pheduyet/{maDot}")]
        [Authorize(Roles = "HieuTruong")]
        public async Task<ActionResult<BaseResponse<bool>>> RectorApprove(int maDot)
        {
            var maCBClaim = User.FindFirst("MaCB")?.Value;
            if (!int.TryParse(maCBClaim, out int maCB)) maCB = 0;

            var result = await _service.RectorApproveAsync(maDot, maCB);

            return Ok(new BaseResponse<bool>
            {
                Success = result,
                Message = result ? "Phê duyệt đợt học bổng và chốt danh sách chính thức thành công." : "Phê duyệt thất bại.",
                Data = result
            });
        }

        // =======================================================
        // Task 3.6: Hiệu trưởng trả hồ sơ
        // =======================================================
        [HttpPut("/api/hieutruong/tra-ho-so/{maDot}")]
        [Authorize(Roles = "HieuTruong")]
        public async Task<ActionResult<BaseResponse<bool>>> TraHoSo(int maDot, [FromBody] string lyDo)
        {
            if (string.IsNullOrWhiteSpace(lyDo))
            {
                return BadRequest(new BaseResponse<bool> { Success = false, Message = "Vui lòng nhập lý do trả hồ sơ." });
            }

            var result = await _service.TraHoSoAsync(maDot, lyDo);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        // =======================================================
        // Xóa hồ sơ (CTSV)
        // =======================================================
        [HttpDelete("/api/ctsv/ho-so/{maHoSo}")]
        [Authorize(Roles = "CTSV")]
        public async Task<ActionResult<BaseResponse<bool>>> XoaHoSo(int maHoSo)
        {
            var result = await _service.XoaHoSoAsync(maHoSo);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("cong-bo-lay-y-kien/{maDot}")]
        // [Authorize(Roles = "CTSV")] // Bỏ comment nếu dự án có dùng Authorize
        public async Task<IActionResult> CongBoLayYKien(int maDot)
        {
            var result = await _service.CongBoLayYKienAsync(maDot);
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }

        [HttpPut("tua-nhanh-demo/{maDot}")]
        // [Authorize(Roles = "CTSV")]
        public async Task<IActionResult> TuaNhanhDemo(int maDot)
        {
            var result = await _service.TuaNhanhThoiGianDemoAsync(maDot);
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }
        [HttpPut("tu-choi-ho-so/{maHoSo}")]
        public async Task<IActionResult> TuChoiHoSo(int maHoSo, [FromBody] string lyDo)
        {
            var result = await _service.TuChoiHoSoAsync(maHoSo, lyDo);
            if (result.Success) return Ok(result);
            return BadRequest(result);
        }
    }
}
