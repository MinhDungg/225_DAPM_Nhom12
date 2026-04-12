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
        // Cập nhật ở dòng ActionResult bên dưới từ Model sang DTO
        public async Task<ActionResult<BaseResponse<IEnumerable<HoSoResponseDTO>>>> GetSystemWideSummaryAsync()
        {
            var profiles = await _service.GetRecommendedProfilesAsync();
            
            return Ok(new BaseResponse<IEnumerable<HoSoResponseDTO>>
            {
                Success = true,
                Message = "Lấy danh sách tổng hợp toàn trường thành công.",
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
                Message = result ? "Cập nhật hồ sơ thành DanhSachDuKien thành công." : "Không có hồ sơ nào được cập nhật.",
                Data = result
            });
        }
    }
}
