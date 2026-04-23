using BE.DTOs.Response; // Gắn thêm DTO vào
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Services.Interfaces
{
    public interface IFinalDecisionService
    {
        Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync(bool isHoiDong); Task<bool> ApproveExpectedListAsync(List<int> profileIds);
        Task<IEnumerable<HoSoResponseDTO>> GetStudentProgressAsync(string maSV);
        Task<bool> RectorApproveAsync(int maDot, int maCB);
        Task<BaseResponse<bool>> CTSVTrinhHieuTruongAsync(int maDot);
        Task<BaseResponse<bool>> XoaHoSoAsync(int maHoSo);
        Task<BaseResponse<bool>> TraHoSoAsync(int maDot, string lyDo);
        // Thêm tham số bool isHieuTruong
        Task<TongHopHieuTruongResponseDTO?> GetToTrinhHieuTruongAsync(int maDot, bool isHieuTruong);
    }
}