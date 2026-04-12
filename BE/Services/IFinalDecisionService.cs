using BE.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE.Services
{
    // Cần phải có Interface này để Controller gọi qua (N-Tier Standard)
    public interface IFinalDecisionService
    {
        Task<IEnumerable<HoSoXetHocBong>> GetDanhSachKhoaDeXuatAsync();
        Task<bool> PheDuyetDanhSachDuKienAsync(List<int> maHoSoList);
    }

    public class FinalDecisionService : IFinalDecisionService
    {
        // Tạm thời return mảng rỗng và true để bạn Pass qua các lỗi đỏ và có form chuẩn.
        // Sau khi bạn tạo Repositories, bạn sẽ inject Repo vào đây để gọi DB thật.
        public async Task<IEnumerable<HoSoXetHocBong>> GetDanhSachKhoaDeXuatAsync()
        {
            // TODO: Triển khai gọi sang Repository lấy tự DB (Ví dụ: await _repo.GetHoSoByTrangThaiAsync("KhoaDeXuat");)
            return await Task.FromResult(new List<HoSoXetHocBong>()); 
        }

        public async Task<bool> PheDuyetDanhSachDuKienAsync(List<int> maHoSoList)
        {
            // TODO: Triển khai gọi sang Repository để update DB (Ví dụ: await _repo.UpdateTrangThaiHinhThucAsync(...);)
            if (maHoSoList == null || maHoSoList.Count == 0) return false;
            return await Task.FromResult(true);
        }
    }
}
