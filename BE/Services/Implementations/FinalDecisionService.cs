using BE.Models;
using System.Collections.Generic;
using System.Linq; // Cần Linq cho hàm Select
using System.Threading.Tasks;
using BE.Services.Interfaces;
using BE.Repositories.Interfaces;
using BE.DTOs.Response; // Gọi DTO

namespace BE.Services.Implementations
{
    public class FinalDecisionService : IFinalDecisionService
    {
        private readonly IHoSoXetHocBongRepository _repository;

        // Tiêm Db Repository 
        public FinalDecisionService(IHoSoXetHocBongRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync()
        {
            // Vớt nguyên cục data từ Database (Kèm theo SinhVien và Lop)
            var rawData = await _repository.GetProfilesByStatusAsync("KhoaDeXuat"); 

            // Cạo sạch Data thừa, ép vào DTO (Mô hình phẳng)
            var cleanData = rawData.Select(h => new HoSoResponseDTO
            {
                MaHoSo = h.MaHoSo,
                MaSV = h.MaSV,
                HoTen = h.SinhVien?.HoTen, 
                TenLop = h.SinhVien?.Lop?.TenLop,
                GPA = h.GPA,
                DiemNCKH = h.DiemNCKH, // Điểm double thì gán trực tiếp, xóa ??
                DiemHDCD = h.DiemHDCD, 
                XepLoaiHB = h.XepLoaiHB,
                TrangThai = h.TrangThai
            });

            return cleanData;
        }

        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || profileIds.Count == 0) return false;
            
            return await _repository.UpdateProfilesStatusAsync(profileIds, "DanhSachDuKien");
        }
    }
}
