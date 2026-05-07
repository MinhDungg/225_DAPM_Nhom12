using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace BE.Services.Implementations
{
    public class FinalDecisionService : IFinalDecisionService
    {
        private readonly IHoSoXetHocBongRepository _hoSoRepository;
        private readonly IDotHocBongRepository _dotHocBongRepository;
        private readonly IPhanBoKinhPhiRepository _phanBoKinhPhiRepository;
        private readonly IDiemRenLuyenRepository _diemRenLuyenRepository;
        private readonly IConfiguration _configuration;
        public FinalDecisionService(
            IHoSoXetHocBongRepository hoSoRepository,
            IDotHocBongRepository dotHocBongRepository,
            IPhanBoKinhPhiRepository phanBoKinhPhiRepository,
            IDiemRenLuyenRepository diemRenLuyenRepository,
            IConfiguration configuration)
        {
            _hoSoRepository = hoSoRepository;
            _dotHocBongRepository = dotHocBongRepository;
            _phanBoKinhPhiRepository = phanBoKinhPhiRepository;
            _diemRenLuyenRepository = diemRenLuyenRepository;
            _configuration = configuration;
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
                GPA = p.GPA,
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

            var updated = await _hoSoRepository.UpdateProfilesStatusAsync(profileIds, "HoiDongDuyet");
            if (!updated)
                return false;

            var firstProfile = await _hoSoRepository.GetByIdAsync(profileIds.First());
            if (firstProfile?.MaDot != null)
            {
                var dot = await _dotHocBongRepository.LayTheoIdAsync(firstProfile.MaDot);
                if (dot != null)
                {
                    dot.TrangThai = "DuKien";
                    await _dotHocBongRepository.UpdateAsync(dot);
                }
            }

            return true;
        }

        // CTSV lập tờ trình lên Hiệu trưởng
        public async Task<BaseResponse<bool>> CTSVTrinhHieuTruongAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };

            // --- ĐOẠN CODE KIỂM TRA 10 NGÀY BẮT ĐẦU TỪ ĐÂY ---
            // (Lưu ý: Bạn phải thêm thuộc tính public DateTime? NgayCongBo { get; set; } vào file BE/Models/DotHocBong.cs trước nhé)
            
            bool isDemoMode = _configuration.GetValue<bool>("AppSettings:IsDemoMode");

            if (dot.TrangThai == "CongBoLayYKien" && dot.NgayCongBo.HasValue)
            {
                var soNgayDaQua = (DateTime.Now - dot.NgayCongBo.Value).TotalDays;
                
                // Nếu không phải Demo và chưa đủ 10 ngày thì chặn lại
                if (!isDemoMode && soNgayDaQua < 10)
                {
                    return new BaseResponse<bool> { Success = false, Message = $"Chưa hết thời hạn 10 ngày lấy ý kiến. (Mới trôi qua {Math.Round(soNgayDaQua, 1)} ngày)." };
                }
            }
            else if (dot.TrangThai != "CongBoLayYKien")
            {
                // Chưa được công bố thì không cho trình
                return new BaseResponse<bool> { Success = false, Message = "Đợt này chưa được công bố lấy ý kiến sinh viên." };
            }
            // --- KẾT THÚC ĐOẠN CODE KIỂM TRA ---

            var hoSos = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet"); // Hoặc Get theo CongBoLayYKien tuỳ logic của bạn
            if (!hoSos.Any(h => h.MaDot == maDot))
            {
                return new BaseResponse<bool> { Success = false, Message = "Chưa có hồ sơ nào được duyệt để trình lên." };
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
                    GPA = h.GPA,
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
                GPA = p.GPA,
                DiemHocTap = p.DiemHocTap,
                DiemRenLuyen = p.DiemRenLuyen,
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
        // 1. Hàm công bố danh sách
        public async Task<BaseResponse<bool>> CongBoLayYKienAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt." };

            if (dot.TrangThai != "HoiDongDuyet")
            {
                return new BaseResponse<bool> { Success = false, Message = "Hội đồng chưa chốt danh sách, không thể công bố." };
            }
            
                dot.TrangThai = "CongBoLayYKien"; 
                dot.NgayCongBo = DateTime.Now; // Bắt đầu tính giờ
                await _dotHocBongRepository.UpdateAsync(dot);

                return new BaseResponse<bool> { Success = true, Message = "Đã công bố danh sách cho Sinh viên phản hồi trong 10 ngày.", Data = true };
        }

        // 2. Hàm Tua nhanh thời gian cho Demo
        public async Task<BaseResponse<bool>> TuaNhanhThoiGianDemoAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null || !dot.NgayCongBo.HasValue) 
            {
                return new BaseResponse<bool> { Success = false, Message = "Chưa công bố nên không thể tua thời gian." };
            }

            dot.NgayCongBo = dot.NgayCongBo.Value.AddDays(-11);
            await _dotHocBongRepository.UpdateAsync(dot);

            return new BaseResponse<bool> { Success = true, Message = "Đã tua nhanh qua 10 ngày để Demo!", Data = true };
        }
        public async Task<BaseResponse<bool>> TuChoiHoSoAsync(int maHoSo, string lyDo)
        {
            var hoSo = await _hoSoRepository.GetByIdAsync(maHoSo);
            if (hoSo == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy hồ sơ." };

            if (string.IsNullOrWhiteSpace(lyDo)) 
                return new BaseResponse<bool> { Success = false, Message = "Bắt buộc phải nhập lý do từ chối." };

            // Đổi trạng thái thành Từ Chối và lưu Lý do
            hoSo.TrangThai = "TuChoi";
            hoSo.GhiChu = lyDo;
            await _hoSoRepository.CapNhatXepLoaiVaTrangThaiAsync(new List<HoSoXetHocBong> { hoSo });


            return new BaseResponse<bool> { Success = true, Message = "Từ chối hồ sơ thành công.", Data = true };
        }

    }
}