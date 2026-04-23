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

        // Tổng hợp dữ liệu từ Khoa đề xuất
        public async Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync(bool isHoiDong)
        {
            // LOGIC TỰ ĐỘNG PHÂN LUỒNG:
            // - Nếu Hội đồng đăng nhập -> Tìm danh sách 'KhoaDeXuat' để duyệt
            // - Nếu CTSV đăng nhập -> Tìm danh sách 'HoiDongDuyet' để lập tờ trình
            string statusToFetch = isHoiDong ? "KhoaDeXuat" : "HoiDongDuyet";

            var profiles = await _hoSoRepository.GetProfilesByStatusAsync(statusToFetch);

            return profiles.Select(p => new HoSoResponseDTO
            {
                MaHoSo = p.MaHoSo,
                MaSV = p.MaSV,
                HoTen = p.SinhVien?.HoTen,
                TenLop = p.SinhVien?.Lop?.TenLop,
                TenKhoa = p.SinhVien?.Lop?.Khoa?.TenKhoa,
                GPA = p.DiemHocTap,
                DiemHocTap = p.DiemHocTap,
                DiemRenLuyen = p.DiemRenLuyen,
                XepLoaiHB = p.XepLoaiHB,
                TrangThai = p.TrangThai
            });
        }

        // Hội đồng chốt danh sách
        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any())
                return false;

            return await _hoSoRepository.UpdateProfilesStatusAsync(profileIds, "HoiDongDuyet");
        }

        // CTSV lập tờ trình lên Hiệu trưởng
        public async Task<BaseResponse<bool>> CTSVTrinhHieuTruongAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };

            var hoSos = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
            if (!hoSos.Any(h => h.MaDot == maDot))
            {
                return new BaseResponse<bool> { Success = false, Message = "Chưa có hồ sơ nào được Hội đồng duyệt để trình lên." };
            }

            dot.TrangThai = "ChoPheDuyet";
            await _dotHocBongRepository.UpdateAsync(dot);

            return new BaseResponse<bool> { Success = true, Message = "Đã khóa danh sách và gửi Tờ trình lên Ban Giám Hiệu.", Data = true };
        }

        // Lấy dữ liệu Tờ trình cho Hiệu Trưởng xem
        public async Task<TongHopHieuTruongResponseDTO?> GetToTrinhHieuTruongAsync(int maDot, bool isHieuTruong)
        {
            var dotHocBong = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dotHocBong == null) return null;

            // LÔ-GIC CHẶN CHỈ ÁP DỤNG CHO HIỆU TRƯỞNG
            if (isHieuTruong)
            {
                if (dotHocBong.TrangThai != "ChoPheDuyet" && dotHocBong.TrangThai != "ChinhThuc" && dotHocBong.TrangThai != "DangXetDuyet")
                {
                    // Hiệu trưởng không được xem khi CTSV chưa trình
                    return null;
                }
            }
            // Nếu là CTSV thì đoạn if trên sẽ bị bỏ qua, CTSV được phép xem tiếp để rà soát hồ sơ.

            var phanBoKinhPhis = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(maDot);
            decimal tongKinhPhi = phanBoKinhPhis.Sum(p => p.KinhPhi);

            // Lấy danh sách hồ sơ tùy theo trạng thái đợt
            string statusToFetch = dotHocBong.TrangThai == "ChinhThuc" ? "ChinhThuc" : "HoiDongDuyet";
            var allProfiles = await _hoSoRepository.GetProfilesByStatusAsync(statusToFetch);
            var profilesForRound = allProfiles.Where(h => h.MaDot == maDot).ToList();

            var danhSachDTO = new List<HoSoResponseDTO>();
            foreach (var h in profilesForRound)
            {
                var diemRL = await _diemRenLuyenRepository.GetDiemRenLuyenAsync(h.MaSV, dotHocBong.HocKy, dotHocBong.NamHoc);

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

        // Hiệu trưởng phê duyệt (Chốt danh sách và đợt)
        public async Task<bool> RectorApproveAsync(int maDot, int maCB)
        {
            return await _hoSoRepository.FinalizeScholarshipRoundAsync(maDot, maCB);
        }

        // Sinh viên tra cứu hồ sơ cá nhân
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

        // Hiệu trưởng trả hồ sơ về CTSV (Yêu cầu giải trình)
        public async Task<BaseResponse<bool>> TraHoSoAsync(int maDot, string lyDo)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };

            if (dot.TrangThai != "ChoPheDuyet")
            {
                return new BaseResponse<bool> { Success = false, Message = "Chỉ có thể trả hồ sơ khi đang chờ phê duyệt." };
            }

            dot.TrangThai = "DangXetDuyet";
            dot.LyDoTraVe = lyDo;
            
            await _dotHocBongRepository.UpdateAsync(dot);

            return new BaseResponse<bool> { Success = true, Message = "Đã trả hồ sơ về cho CTSV.", Data = true };
        }

        // Xóa hồ sơ (CTSV)
        public async Task<BaseResponse<bool>> XoaHoSoAsync(int maHoSo)
        {
            var hoSo = await _hoSoRepository.GetByIdAsync(maHoSo);
            if (hoSo == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy hồ sơ." };

            await _hoSoRepository.DeleteAsync(maHoSo);

            return new BaseResponse<bool> { Success = true, Message = "Xóa hồ sơ thành công.", Data = true };
        }
    }
}