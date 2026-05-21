using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System;

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
        public async Task<IEnumerable<HoSoResponseDTO>> GetRecommendedProfilesAsync(bool isHoiDong, int? maDot = null)
        {
            IEnumerable<HoSoXetHocBong> profiles;

            if (maDot.HasValue)
            {
                var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot.Value);
                if (dot == null) return Enumerable.Empty<HoSoResponseDTO>();

                // Nếu đợt đã qua DangXetDuyet
                if (dot.TrangThai != "DangXetDuyet" && dot.TrangThai != "KhoiTao" && dot.TrangThai != "DaCoDiem")
                {
                    // Các hồ sơ Hội đồng đã duyệt hoặc từ chối
                    var list1 = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
                    var list2 = await _hoSoRepository.GetProfilesByStatusAsync("ChinhThuc");
                    var list3 = await _hoSoRepository.GetProfilesByStatusAsync("TuChoi");
                    profiles = list1.Concat(list2).Concat(list3).Where(p => p.MaDot == maDot.Value).ToList();
                }
                else
                {
                    string statusToFetch = isHoiDong ? "KhoaDeXuat" : "HoiDongDuyet";
                    profiles = (await _hoSoRepository.GetProfilesByStatusAsync(statusToFetch)).Where(p => p.MaDot == maDot.Value).ToList();
                }
            }
            else
            {
                string statusToFetch = isHoiDong ? "KhoaDeXuat" : "HoiDongDuyet";
                profiles = await _hoSoRepository.GetProfilesByStatusAsync(statusToFetch);
            }

            var dotIds = profiles.Select(p => p.MaDot).Distinct().ToList();
            var phanBoLookup = new Dictionary<(int MaDot, int MaKhoa), decimal>();
            foreach (var dotId in dotIds)
            {
                var phanBos = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(dotId);
                foreach (var pb in phanBos)
                {
                    phanBoLookup[(pb.MaDot, pb.MaKhoa)] = pb.MucHBLoaiKha;
                }
            }

            return profiles.Select(p =>
            {
                decimal? mucHB = p.MucHocBong;
                if ((!mucHB.HasValue || mucHB == 0) && p.SinhVien?.Lop != null)
                {
                    if (phanBoLookup.TryGetValue((p.MaDot, p.SinhVien.Lop.MaKhoa), out var mucKha))
                    {
                        mucHB = p.XepLoaiHB switch
                        {
                            "XuatSac" => mucKha * 1.4m,
                            "Gioi" => mucKha * 1.2m,
                            "Kha" => mucKha,
                            _ => 0
                        };
                    }
                }

                return new HoSoResponseDTO
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
                    TrangThai = p.TrangThai,
                    MucHocBong = mucHB
                };
            }).ToList();
        }

        // Hội đồng chốt danh sách
        public async Task<bool> ApproveExpectedListAsync(List<int> profileIds)
        {
            if (profileIds == null || !profileIds.Any())
                return false;

            var result = await _hoSoRepository.UpdateProfilesStatusAsync(profileIds, "HoiDongDuyet");
            if (result)
            {
                var firstProfile = await _hoSoRepository.GetByIdAsync(profileIds.First());
                if (firstProfile != null)
                {
                    var dot = await _dotHocBongRepository.LayTheoIdAsync(firstProfile.MaDot);
                    if (dot != null)
                    {
                        dot.TrangThai = "DuKien";
                        await _dotHocBongRepository.UpdateAsync(dot);
                    }
                }
            }
            return result;
        }

        // CTSV lập tờ trình lên Hiệu trưởng
        public async Task<BaseResponse<bool>> CTSVTrinhHieuTruongAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt học bổng." };

            // --- TRƯỜNG HỢP TRÌNH LẠI: Hiệu Trưởng đã trả về (DangXetDuyet) ---
            if (dot.TrangThai == "DangXetDuyet")
            {
                // Kiểm tra còn hồ sơ hợp lệ không
                var hoSosTrinhLai = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
                if (!hoSosTrinhLai.Any(h => h.MaDot == maDot))
                {
                    return new BaseResponse<bool> { Success = false, Message = "Không còn hồ sơ nào để trình lại. Vui lòng kiểm tra lại danh sách." };
                }

                // Xóa lý do trả về cũ và trình lại
                dot.TrangThai = "ChoPheDuyet";
                dot.LyDoTraVe = null;
                await _dotHocBongRepository.UpdateAsync(dot);

                return new BaseResponse<bool> { Success = true, Message = "Đã trình lại danh sách lên Ban Giám Hiệu thành công.", Data = true };
            }

            // --- ĐOẠN CODE KIỂM TRA 10 NGÀY BẮT ĐẦU TỪ ĐÂY ---
            bool isDemoMode = _configuration.GetValue<bool>("AppSettings:IsDemoMode");

            if (dot.TrangThai == "CongBoLayYKien" && dot.NgayCongBo.HasValue)
            {
                var soNgayDaQua = (DateTime.Now - dot.NgayCongBo.Value).TotalDays;
                
                // Nếu không phải Demo và chưa đủ 10 ngày thì chặn lại
                if (!isDemoMode && soNgayDaQua < 10)
                {
                    return new BaseResponse<bool> { Success = false, Message = $"Chưa hết thời hạn 10 ngày lấy ý kiến. (Mới trôi qua {Math.Round(soNgayDaQua, 1)} ngày)." };
                }
                else 
                {
                    dot.TrangThai = "LayYKienHoanTat";
                    await _dotHocBongRepository.UpdateAsync(dot);
                }
            }
            else if (dot.TrangThai != "LayYKienHoanTat")
            {
                // Chưa được công bố hoặc chưa hoàn tất thì không cho trình
                return new BaseResponse<bool> { Success = false, Message = "Đợt này chưa hoàn tất việc lấy ý kiến sinh viên." };
            }
            // --- KẾT THÚC ĐOẠN CODE KIỂM TRA ---

            var hoSos = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
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

            var phanBoLookup = phanBoKinhPhis.ToDictionary(p => p.MaKhoa, p => p.MucHBLoaiKha);

            var danhSachDTO = new List<HoSoResponseDTO>();
            foreach (var h in profilesForRound)
            {
                var diemRL = await _diemRenLuyenRepository.GetDiemRenLuyenAsync(h.MaSV, dotHocBong.HocKy, dotHocBong.NamHoc);

                decimal? mucHB = h.MucHocBong;
                if ((!mucHB.HasValue || mucHB == 0) && h.SinhVien?.Lop != null)
                {
                    if (phanBoLookup.TryGetValue(h.SinhVien.Lop.MaKhoa, out var mucKha))
                    {
                        mucHB = h.XepLoaiHB switch
                        {
                            "XuatSac" => mucKha * 1.4m,
                            "Gioi" => mucKha * 1.2m,
                            "Kha" => mucKha,
                            _ => 0
                        };
                    }
                }

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
                    TrangThai = h.TrangThai,
                    MucHocBong = mucHB
                });
            }

            // Tính tổng tiền đã chi trong lịch sử (các đợt đã ChinhThuc)
            var allChinhThucProfiles = await _hoSoRepository.GetProfilesByStatusAsync("ChinhThuc");
            var allChinhThucDotIds = allChinhThucProfiles.Select(p => p.MaDot).Distinct().ToList();
            var allPhanBoLookup = new Dictionary<(int MaDot, int MaKhoa), decimal>();
            foreach (var dotId in allChinhThucDotIds)
            {
                var phanBos = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(dotId);
                foreach (var pb in phanBos)
                {
                    allPhanBoLookup[(pb.MaDot, pb.MaKhoa)] = pb.MucHBLoaiKha;
                }
            }

            decimal tongTienDaChi = allChinhThucProfiles
                .Sum(h =>
                {
                    decimal? mucHB = h.MucHocBong;
                    if ((!mucHB.HasValue || mucHB == 0) && h.SinhVien?.Lop != null)
                    {
                        if (allPhanBoLookup.TryGetValue((h.MaDot, h.SinhVien.Lop.MaKhoa), out var mucKha))
                        {
                            mucHB = h.XepLoaiHB switch
                            {
                                "XuatSac" => mucKha * 1.4m,
                                "Gioi" => mucKha * 1.2m,
                                "Kha" => mucKha,
                                _ => 0
                            };
                        }
                    }
                    return mucHB ?? 0;
                });

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
                TongTienDaChi = tongTienDaChi,
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
                TrangThai = p.TrangThai,
                MucHocBong = p.MucHocBong,
                LoaiDot = p.DotHocBong?.LoaiDot,
                HocKy = p.DotHocBong?.HocKy,
                NamHoc = p.DotHocBong?.NamHoc,
                NgayNop = p.NgayNop,
                GhiChu = p.GhiChu
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
        // 1. Hàm công bộ danh sách
        public async Task<BaseResponse<bool>> CongBoLayYKienAsync(int maDot)
        {
            var dot = await _dotHocBongRepository.LayTheoIdAsync(maDot);
            if (dot == null) return new BaseResponse<bool> { Success = false, Message = "Không tìm thấy đợt." };

            if (dot.TrangThai != "DuKien" && dot.TrangThai != "HoiDongDuyet")
            {
                return new BaseResponse<bool> { Success = false, Message = "Đợt chưa ở trạng thái Dự Kiến hoặc Hội đồng chưa chốt danh sách, không thể công bố." };
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
            dot.TrangThai = "LayYKienHoanTat";
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

        public async Task<IEnumerable<LichSuChiHocBongDTO>> GetLichSuChiHocBongAsync()
        {
            // Lấy tất cả các đợt học bổng
            var allDots = await _dotHocBongRepository.LayDanhSachAsync();
            
            // Lọc các đợt đã hoàn thành hoặc đang xử lý
            var completedDots = allDots
                .Where(d => d.TrangThai == "ChinhThuc" || d.TrangThai == "ChoPheDuyet" || d.TrangThai == "DangXetDuyet")
                .ToList();

            var lichSuList = new List<LichSuChiHocBongDTO>();

            foreach (var dot in completedDots)
            {
                // Lấy TẤT CẢ hồ sơ của đợt này (không chỉ ChinhThuc)
                var allHoSos = await _hoSoRepository.GetProfilesByStatusAsync("ChinhThuc");
                var hoSosChinhThuc = allHoSos.Where(h => h.MaDot == dot.MaDot).ToList();

                // Nếu đợt chưa có hồ sơ ChinhThuc, thử lấy các hồ sơ khác
                if (!hoSosChinhThuc.Any())
                {
                    var hoSosKhoaDeXuat = await _hoSoRepository.GetProfilesByStatusAsync("KhoaDeXuat");
                    var hoSosHoiDongDuyet = await _hoSoRepository.GetProfilesByStatusAsync("HoiDongDuyet");
                    
                    hoSosChinhThuc = hoSosKhoaDeXuat
                        .Concat(hoSosHoiDongDuyet)
                        .Where(h => h.MaDot == dot.MaDot)
                        .ToList();
                }

                var phanBos = await _phanBoKinhPhiRepository.LayTheoMaDotAsync(dot.MaDot);
                var phanBoLookup = phanBos.ToDictionary(pb => pb.MaKhoa, pb => pb.MucHBLoaiKha);

                // Tính tổng tiền thực tế đã phân bổ
                decimal tongChi = hoSosChinhThuc
                    .Sum(h =>
                    {
                        decimal? mucHB = h.MucHocBong;
                        if ((!mucHB.HasValue || mucHB == 0) && h.SinhVien?.Lop != null)
                        {
                            if (phanBoLookup.TryGetValue(h.SinhVien.Lop.MaKhoa, out var mucKha))
                            {
                                mucHB = h.XepLoaiHB switch
                                {
                                    "XuatSac" => mucKha * 1.4m,
                                    "Gioi" => mucKha * 1.2m,
                                    "Kha" => mucKha,
                                    _ => 0
                                };
                            }
                        }
                        return mucHB ?? 0;
                    });

                lichSuList.Add(new LichSuChiHocBongDTO
                {
                    MaDot = dot.MaDot,
                    LoaiDot = dot.LoaiDot,
                    HocKy = dot.HocKy,
                    NamHoc = dot.NamHoc,
                    SoSinhVien = hoSosChinhThuc.Count,
                    TongChi = tongChi,
                    TrangThai = dot.TrangThai
                });
            }

            // Sắp xếp theo năm học và học kỳ giảm dần
            return lichSuList.OrderByDescending(l => l.NamHoc).ThenByDescending(l => l.HocKy);
        }

    }
}