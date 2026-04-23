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
        // TASK 3.1: Tổng hợp dữ liệu toàn trường (CTSV/Hội đồng xem lúc đầu)
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
                XepLoaiHB = p.XepLoaiHB,
                TrangThai = p.TrangThai
            });
        }

        // ====================================================================
        // TASK 3.2: Hội đồng xét chọn (Chốt danh sách gửi về CTSV)
        // ====================================================================
        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any())
                return false;

            return await _hoSoRepository.UpdateProfilesStatusAsync(profileIds, "HoiDongDuyet");
        }

        // ====================================================================
        // TASK 3.3: CTSV Rà soát và Lập Tờ Trình lên Hiệu trưởng
        // ====================================================================
        public async Task<BaseResponse<bool>> CTSVTrinhHieuTruongAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null)
            {
                return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };
            }

            // Lấy các hồ sơ đã được Hội đồng duyệt
            var hoSos = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
            if (!hoSos.Any(h => h.MaDot == maDot))
            {
                return new BaseResponse<bool> { Success = false, Message = "Chưa có hồ sơ nào được Hội đồng duyệt để trình lên." };
            }

            // Mở khóa cho Hiệu trưởng thấy Tờ trình bằng cách đổi trạng thái Đợt HB
            dot.TrangThai = "ChoPheDuyet";
            await _dotHocBongRepository.UpdateAsync(dot);

            return new BaseResponse<bool>
            {
                Success = true,
                Message = "Đã khóa danh sách và gửi Tờ trình lên Ban Giám Hiệu.",
                Data = true
            };
        }

        // ====================================================================
        // TASK 3.4: Dữ liệu Tờ trình cho Dashboard Hiệu Trưởng (Hiển thị)
        // ====================================================================
        public async Task<TongHopHieuTruongResponseDTO?> GetToTrinhHieuTruongAsync(int maDot)
        {
            var dotHocBong = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dotHocBong == null) return null;

            // CHẶN BẢO MẬT: Nếu CTSV chưa trình (ChoPheDuyet) và đợt chưa chốt (ChinhThuc) thì Hiệu trưởng không thấy gì
            if (dotHocBong.TrangThai != "ChoPheDuyet" && dotHocBong.TrangThai != "ChinhThuc")
            {
                return null;
            }

            // Tính toán tổng kinh phí
            var phanBoKinhPhis = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(maDot);
            decimal tongKinhPhi = phanBoKinhPhis.Sum(p => p.KinhPhi);

            // LOGIC CỐT LÕI:
            // - Đang chờ duyệt: Lấy đúng danh sách CTSV vừa trình lên (HoiDongDuyet)
            // - Đã duyệt xong: Lấy danh sách lịch sử chính thức (ChinhThuc)
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
        // TASK 3.5: Hiệu trưởng phê duyệt (Final Trigger)
        // ====================================================================
        public async Task<bool> RectorApproveAsync(int maDot, int maCB)
        {
            // Tận dụng hàm Finalize có sẵn trong Repo (Chuyển hồ sơ -> ChinhThuc, Đợt -> ChinhThuc, Chèn DSHocBong)
            return await _hoSoRepository.FinalizeScholarshipRoundAsync(maDot, maCB);
        }

        // ====================================================================
        // TASK 3.6: Sinh viên tra cứu trạng thái hồ sơ của cá nhân
        // ====================================================================
        public async Task<IEnumerable<HoSoResponseDTO>> GetStudentProgressAsync(string maSV)
        {
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
    }
}