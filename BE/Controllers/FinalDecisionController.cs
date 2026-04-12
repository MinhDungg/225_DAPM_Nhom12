using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BE.DTOs.Response;      // Đã sửa: Nơi chứa BaseResponse
using BE.Models;    // Cần có để nhận diện HoSoXetHocBong
using BE.Services;  // Đã thêm: Nơi chứa IFinalDecisionService
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Controllers
{
    [ApiController]
    [Route("api/tructhuoc")] // Có thể gom CTSV chung đường dẫn, hoặc tách rời
    public class FinalDecisionController : ControllerBase
    {
        private readonly IFinalDecisionService _service;

        public FinalDecisionController(IFinalDecisionService service)
        {
            _service = service;
        }

        // Task 3.1: Tổng hợp dữ liệu toàn trường (Trạng thái KhoaDeXuat)
        [HttpGet("/api/ctsv/tonghop")]
        [Authorize(Roles = "CTSV,HoiDong")] // Chỉ có CTSV và Hội đồng được xem
        public async Task<ActionResult<BaseResponse<IEnumerable<HoSoXetHocBong>>>> GetTongHopToanTruong()
        {
            var dsHoSo = await _service.GetDanhSachKhoaDeXuatAsync();
            
            return Ok(new BaseResponse<IEnumerable<HoSoXetHocBong>>
            {
                Success = true,
                Message = "Lấy danh sách tổng hợp toàn trường thành công.",
                Data = dsHoSo
            });
        }

        // Task 3.2: Hội đồng xét chọn hồ sơ
        [HttpPut("/api/hoidong/xetchon")]
        [Authorize(Roles = "HoiDong")] // Chỉ có thành viên Hội đồng được thực thao tác này
        public async Task<ActionResult<BaseResponse<bool>>> XetChonHoiDong([FromBody] List<int> danhSachMaHoSoDuocChon)
        {
            var result = await _service.PheDuyetDanhSachDuKienAsync(danhSachMaHoSoDuocChon);
            
            return Ok(new BaseResponse<bool>
            {
                Success = result,
                Message = result ? "Cập nhật hồ sơ thành DanhSachDuKien thành công." : "Không có hồ sơ nào được cập nhật.",
                Data = result
            });
        }
    }
}
