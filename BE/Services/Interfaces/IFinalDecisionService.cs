using BE.DTOs.Response; // Gắn thêm DTO vào
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Services.Interfaces
{
    public interface IFinalDecisionService
    {
        Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync();
        Task<bool> ApproveExpectedListAsync(List<int> profileIds);
    }
}
