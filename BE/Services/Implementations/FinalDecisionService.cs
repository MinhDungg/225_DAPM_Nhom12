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
        private readonly IDiemRenLuyenRepository _diemRenLuyenRepository;

        public FinalDecisionService(
            IHoSoXetHocBongRepository hoSoRepository,
            IDotHocBongRepository dotHocBongRepository,
            IPhanBoKinhPhiRepository phanBoKinhPhiRepository,
            IDiemRenLuyenRepository diemRenLuyenRepository)
        {
            _hoSoRepository = hoSoRepository;
            _dotHocBongRepository = dotHocBongRepository;
            _phanBoKinhPhiRepository = phanBoKinhPhiRepository;
            _diemRenLuyenRepository = diemRenLuyenRepository;
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

            // CHẶN BẢO MẬT: Mở rộng cho phép CTSV xem trước danh sách khi đợt đang ở trạng thái DangXetDuyet
            if (dotHocBong.TrangThai != "ChoPheDuyet" && dotHocBong.TrangThai != "ChinhThuc" && dotHocBong.TrangThai != "DangXetDuyet")
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

            // Lấy điểm rèn luyện tuần tự (tránh lỗi DbContext concurrency)
            var danhSachDTO = new List<HoSoResponseDTO>();
            foreach (var h in profilesForRound)
            {
                var diemRL = await _diemRenLuyenRepository.GetDiemRenLuyenAsync(
                    h.MaSV, dotHocBong.HocKy, dotHocBong.NamHoc);

                danhSachDTO.Add(new HoSoResponseDTO
                {
                    MaHoSo = h.MaHoSo,
                    MaSV = h.MaSV,
                    HoTen = h.SinhVien?.HoTen,
                    TenLop = h.SinhVien?.Lop?.TenLop,
                    TenKhoa = h.SinhVien?.Lop?.Khoa?.TenKhoa,
                    GPA = h.DiemHocTap,
                    DiemHocTap = h.DiemHocTap,
                    DiemRenLuyen = diemRL ?? h.DiemRenLuyen,
                    XepLoaiHB = h.XepLoaiHB,
                    TrangThai = h.TrangThai
                });
            }

            return new TongHopHieuTruongResponseDTO
            {
                ThongTinDot = new ThongTinDotDTO
                {
                    LoaiDot = dotHocBong.LoaiDot,
                    HocKy = dotHocBong.HocKy,
                    NamHoc = dotHocBong.NamHoc,
                    TrangThai = dotHocBong.TrangThai,
                    LyDoTraVe = dotHocBong.LyDoTraVe
                },
                TongSinhVien = profilesForRound.Count,
                TongKinhPhi = tongKinhPhi,
                DanhSach = danhSachDTO
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
        // ====================================================================
        // TASK 3.6: Hiệu trưởng trả lại hồ sơ (Yêu cầu giải trình)
        // ====================================================================
        public async Task<BaseResponse<bool>> TraHoSoAsync(int maDot, string lyDo)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null)
            {
                return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };
            }

            if (dot.TrangThai != "ChoPheDuyet")
            {
                return new BaseResponse<bool> { Success = false, Message = "Chỉ có thể trả hồ sơ khi đang chờ phê duyệt." };
            }

            dot.TrangThai = "DangXetDuyet";
            dot.LyDoTraVe = lyDo;
            
            await _dotHocBongRepository.UpdateAsync(dot);

            return new BaseResponse<bool>
            {
                Success = true,
                Message = "Đã trả hồ sơ về cho CTSV.",
                Data = true
            };
        }
        // ====================================================================
        // Xóa hồ sơ (CTSV)
        // ====================================================================
        public async Task<BaseResponse<bool>> XoaHoSoAsync(int maHoSo)
        {
            var hoSo = await _hoSoRepository.GetByIdAsync(maHoSo);
            if (hoSo == null)
            {
                return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy hồ sơ." };
            }

            await _hoSoRepository.DeleteAsync(maHoSo);

            return new BaseResponse<bool> { Success = true, Message = "Xóa hồ sơ thành công.", Data = true };
        }
    }
}