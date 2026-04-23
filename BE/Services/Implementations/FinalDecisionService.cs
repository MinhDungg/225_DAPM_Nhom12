using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Services.Implementations
{
    public class FinalDecisionService : IFinalDecisionService
    {
        private readonly IHoSoXetHocBongRepository _hoSoRepository;
        private readonly IDotHocBongRepository _dotHocBongRepository;
        private readonly IPhanBoKinhPhiRepository _phanBoKinhPhiRepository;

        public FinalDecisionService(
            IHoSoXetHocBongRepository hoSoRepository,
            IDotHocBongRepository dotHocBongRepository,
            IPhanBoKinhPhiRepository phanBoKinhPhiRepository)
        {
            _hoSoRepository = hoSoRepository;
            _dotHocBongRepository = dotHocBongRepository;
            _phanBoKinhPhiRepository = phanBoKinhPhiRepository;
        }

        // ====================================================================
        // TASK 3.1: Tổng hợp dữ liệu toàn trường (CTSV/Hội đồng xem)
        // ====================================================================
        public async Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync()
        {
            var profiles = await _hoSoRepository.GetProfilesByStatusAsync("KhoaDeXuat");

            return profiles.Select(p => new HoSoResponseDTO
            {
                MaHoSo = p.MaHoSo,
                MaSV = p.MaSV,
                HoTen = p.SinhVien?.HoTen,
                TenLop = p.SinhVien?.Lop?.TenLop,
                GPA = p.DiemHocTap,
                DiemRenLuyen = p.DiemRenLuyen,
                XepLoaiHB = p.XepLoaiHB,
                TrangThai = p.TrangThai
            });
        }

        // ====================================================================
        // TASK 3.2: Hội đồng xét chọn
        // ====================================================================
        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any())
                return false;

            // FIX: Đổi thành UpdateProfilesStatusAsync cho khớp Interface
            return await _hoSoRepository.UpdateProfilesStatusAsync(profileIds, "HoiDongDuyet");
        }

        // ====================================================================
        // TASK 3.3: Sinh viên tra cứu
        // ====================================================================
        public async Task<IEnumerable<HoSoResponseDTO>> GetStudentProgressAsync(string maSV)
        {
            // FIX: Gọi hàm GetProfilesByMaSVAsync thay vì LayDanhSachAsync
            var studentProfiles = await _hoSoRepository.GetProfilesByMaSVAsync(maSV);

            return studentProfiles.Select(p => new HoSoResponseDTO
            {
                MaHoSo = p.MaHoSo,
                MaSV = p.MaSV,
                HoTen = p.SinhVien?.HoTen,
                TenLop = p.SinhVien?.Lop?.TenLop,
                GPA = p.DiemHocTap,
                XepLoaiHB = p.XepLoaiHB,
                TrangThai = p.TrangThai
            });
        }

        // ====================================================================
        // MỚI THÊM: Dữ liệu Tờ trình cho Dashboard Hiệu Trưởng
        // ====================================================================
        public async Task<TongHopHieuTruongResponseDTO?> GetToTrinhHieuTruongAsync(int maDot)
        {
            var dotHocBong = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dotHocBong == null) return null;

            // Lấy danh sách phân bổ kinh phí theo mã đợt
            var phanBoKinhPhis = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(maDot);
            decimal tongKinhPhi = phanBoKinhPhis.Sum(p => p.KinhPhi);

            string statusToFetch = dotHocBong.TrangThai == "ChinhThuc" ? "ChinhThuc" : "HoiDongDuyet";
            var allProfiles = await _hoSoRepository.GetProfilesByStatusAsync(statusToFetch);
            var profilesForRound = allProfiles.Where(h => h.MaDot == maDot).ToList();

            return new TongHopHieuTruongResponseDTO
            {
                ThongTinDot = new ThongTinDotDTO
                {
                    LoaiDot = dotHocBong.LoaiDot,
                    HocKy = dotHocBong.HocKy,
                    NamHoc = dotHocBong.NamHoc,
                    TrangThai = dotHocBong.TrangThai
                },
                TongSinhVien = profilesForRound.Count,
                TongKinhPhi = tongKinhPhi,
                DanhSach = profilesForRound.Select(h => new HoSoResponseDTO
                {
                    MaHoSo = h.MaHoSo,
                    MaSV = h.MaSV,
                    HoTen = h.SinhVien?.HoTen,
                    TenLop = h.SinhVien?.Lop?.TenLop,
                    GPA = h.DiemHocTap,
                    XepLoaiHB = h.XepLoaiHB,
                    TrangThai = h.TrangThai
                })
            };
        }

        // ====================================================================
        // TASK 3.4: Hiệu trưởng phê duyệt (Final Trigger)
        // ====================================================================
        public async Task<bool> RectorApproveAsync(int maDot, int maCB)
        {
            // FIX: Sử dụng hàm Finalize có sẵn trong Repo thay vì viết lại Logic ở Service
            return await _hoSoRepository.FinalizeScholarshipRoundAsync(maDot, maCB);
        }
    }
}