using BE.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BE.Services.Interfaces;
using BE.Repositories.Interfaces;
using BE.DTOs.Response;

namespace BE.Services.Implementations
{
    public class FinalDecisionService : IFinalDecisionService
    {
        private readonly IHoSoXetHocBongRepository _repository;

        public FinalDecisionService(IHoSoXetHocBongRepository repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Lấy danh sách hồ sơ từ các Khoa gửi lên để Hội đồng xem xét tổng thể.
        /// </summary>
        public async Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync()
        {
            // Truy vấn hồ sơ đang ở trạng thái chờ tổng hợp (KhoaDeXuat)
            var rawData = await _repository.GetProfilesByStatusAsync("KhoaDeXuat");

            // Ánh xạ sang DTO để tinh gọn dữ liệu trả về cho Client
            return rawData.Select(h => new HoSoResponseDTO
            {
                MaHoSo = h.MaHoSo,
                MaSV = h.MaSV,
                HoTen = h.SinhVien?.HoTen,
                TenLop = h.SinhVien?.Lop?.TenLop,
                GPA = h.GPA,
                DiemNCKH = h.DiemNCKH,
                DiemHDCD = h.DiemHDCD,
                XepLoaiHB = h.XepLoaiHB,
                TrangThai = h.TrangThai
            });
        }

        /// <summary>
        /// Chốt danh sách dự kiến sau khi Hội đồng đã xét chọn từ danh sách tổng hợp.
        /// </summary>
        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any()) return false;

            // Cập nhật trạng thái hàng loạt cho các hồ sơ được chọn
            return await _repository.UpdateProfilesStatusAsync(profileIds, "DanhSachDuKien");
        }

        /// <summary>
        /// Lấy tiến trình xử lý hồ sơ dựa trên mã sinh viên (phục vụ tra cứu cá nhân).
        /// </summary>
        public async Task<IEnumerable<HoSoResponseDTO>> GetStudentProgressAsync(string maSV)
        {
            var rawData = await _repository.GetProfilesByMaSVAsync(maSV);

            return rawData.Select(h => new HoSoResponseDTO
            {
                MaHoSo = h.MaHoSo,
                MaSV = h.MaSV,
                GPA = h.GPA,
                XepLoaiHB = h.XepLoaiHB,
                TrangThai = h.TrangThai // SV theo dõi trạng thái từ lúc nộp đến khi chốt sổ
            });
        }

        /// <summary>
        /// Kích hoạt quy trình phê duyệt cuối cùng để ban hành danh sách chính thức.
        /// </summary>
        public async Task<bool> RectorApproveAsync(int maDot, int maCB)
        {
            // Logic xử lý transaction và snapshot dữ liệu sang bảng DSHocBong được thực hiện tại Repository
            return await _repository.FinalizeScholarshipRoundAsync(maDot, maCB);
        }
    }
}