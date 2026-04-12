using BE.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Repositories.Interfaces
{
    public interface IHoSoXetHocBongRepository
    {
        Task<IEnumerable<HoSoXetHocBong>> GetProfilesByStatusAsync(string status);
        Task<bool> UpdateProfilesStatusAsync(List<int> profileIds, string newStatus);
    }
}
