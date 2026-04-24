using BE.Data;
using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BE.Services.Implementations;

public class KhoaService : IKhoaService
{
    private readonly IHoSoXetHocBongRepository _hoSoRepository;
    private readonly AppDbContext _context;

    // Hằng số
    private const decimal DON_GIA_TIN_CHI = 550000m;
    private const int SO_TIN_CHI = 15;
    private const decimal MUC_SAN = DON_GIA_TIN_CHI * SO_TIN_CHI; // 8,250,000
    private const decimal TY_LE_XUAT_SAC = 1.4m; // 140%
    private const decimal TY_LE_GIOI = 1.2m; // 120%
    private const decimal TY_LE_KHA = 1.0m; // 100%

    public KhoaService(IHoSoXetHocBongRepository hoSoRepository, AppDbContext context)
    {
        _hoSoRepository = hoSoRepository;
        _context = context;
    }

    public async Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan)
    {
        // Tìm cán bộ từ tài khoản
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
        {
            return new List<HoSoChoDuyetResponseDTO>();
        }

        // Lấy danh sách hồ sơ chờ duyệt của khoa
        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaAsync(canBo.MaKhoa.Value);

        // Map sang DTO
        var result = hoSos.Select(h => new HoSoChoDuyetResponseDTO
        {
            MaHoSo = h.MaHoSo,
            MaSV = h.MaSV,
            HoTenSinhVien = h.SinhVien.HoTen,
            TenLop = h.SinhVien.Lop.TenLop,
<<<<<<< Updated upstream
            GPA = h.GPA,
=======
            GPA = Math.Round(h.DiemHocTap, 2), // Làm tròn 2 chữ số thập phân
>>>>>>> Stashed changes
            DiemRenLuyen = h.SinhVien.DiemRenLuyens
                .OrderByDescending(d => d.NamHoc)
                .ThenByDescending(d => d.HocKy)
                .FirstOrDefault()?.DiemSo ?? 0,
            DiemNCKH = h.DiemNCKH,
            DiemHDCD = h.DiemHDCD,
            NgayNop = h.NgayNop,
            TrangThai = h.TrangThai ?? "ChoXet"
        }).ToList();

        return result;
    }

    public async Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request)
    {
        // Bước 1: Tìm cán bộ và lấy MaKhoa
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
        {
            throw new Exception("Khong tim thay thong tin can bo hoac khoa");
        }

        // Bước 2: Lấy danh sách hồ sơ chờ duyệt theo Khoa và Đợt
        var hoSos = await _hoSoRepository.LayDanhSachChoDuyetTheoKhoaVaDotAsync(canBo.MaKhoa.Value, request.MaDot);

        if (!hoSos.Any())
        {
            return new XepHangResponseDTO
            {
                TongNganSach = request.NganSach,
                TongChiTieu = 0,
                SoLuongDuocNhan = 0,
                TongSoHoSo = 0,
                DanhSachXepHang = new List<SinhVienXepHangDTO>()
            };
        }

        // Bước 3: Phân loại học bổng và tính mức tiền cho từng hồ sơ
        var danhSachXepHang = new List<(HoSoXetHocBong HoSo, string XepLoai, decimal MucHocBong, int DiemDRL)>();

        foreach (var hoSo in hoSos)
        {
            // Lấy điểm rèn luyện mới nhất
            var diemDRL = hoSo.SinhVien.DiemRenLuyens
                .OrderByDescending(d => d.NamHoc)
                .ThenByDescending(d => d.HocKy)
                .FirstOrDefault()?.DiemSo ?? 0;

            // Phân loại học bổng dựa trên GPA và ĐRL
            var (xepLoai, mucHocBong) = PhanLoaiHocBong(hoSo.GPA, diemDRL);

            danhSachXepHang.Add((hoSo, xepLoai, mucHocBong, diemDRL));
        }

        // Bước 4: Sắp xếp theo GPA giảm dần, nếu bằng nhau thì theo ĐRL giảm dần
        var danhSachDaSapXep = danhSachXepHang
            .OrderByDescending(x => x.HoSo.GPA)
            .ThenByDescending(x => x.DiemDRL)
            .ToList();

        // Bước 5: Trừ lùi ngân sách (Greedy algorithm)
        decimal tongChiTieu = 0;
        int soLuongDuocNhan = 0;
        var danhSachKetQua = new List<SinhVienXepHangDTO>();

        for (int i = 0; i < danhSachDaSapXep.Count; i++)
        {
            var item = danhSachDaSapXep[i];
            bool duocNhan = false;

            // Chỉ xét những sinh viên đủ điều kiện (MucHocBong > 0)
            if (item.MucHocBong > 0 && tongChiTieu + item.MucHocBong <= request.NganSach)
            {
                tongChiTieu += item.MucHocBong;
                soLuongDuocNhan++;
                duocNhan = true;
            }

            // Thêm vào danh sách kết quả
            danhSachKetQua.Add(new SinhVienXepHangDTO
            {
                ThuHang = i + 1,
                MaHoSo = item.HoSo.MaHoSo,
                MaSV = item.HoSo.MaSV,
                HoTen = item.HoSo.SinhVien.HoTen,
                TenLop = item.HoSo.SinhVien.Lop.TenLop,
<<<<<<< Updated upstream
                GPA = item.HoSo.GPA,
=======
                GPA = Math.Round(item.HoSo.DiemHocTap, 2), // Làm tròn 2 chữ số
>>>>>>> Stashed changes
                DiemRenLuyen = item.DiemDRL,
                XepLoai = item.XepLoai,
                MucHocBong = item.MucHocBong,
                DuocNhan = duocNhan
            });
        }

        // Bước 6: Trả về kết quả (KHÔNG cập nhật database - sẽ được xử lý ở Task 2.3)
        return new XepHangResponseDTO
        {
            TongNganSach = request.NganSach,
            TongChiTieu = tongChiTieu,
            SoLuongDuocNhan = soLuongDuocNhan,
            TongSoHoSo = hoSos.Count,
            DanhSachXepHang = danhSachKetQua
        };
    }

    // Helper method: Phân loại học bổng dựa trên Điểm học tập (thang 10) và ĐRL
    private (string XepLoai, decimal MucHocBong) PhanLoaiHocBong(double diemHocTap, int diemDRL)
    {
        // Xuất sắc: Điểm >= 9.0 VÀ ĐRL >= 90
        if (diemHocTap >= 9.0 && diemDRL >= 90)
        {
            return ("XuatSac", MUC_SAN * TY_LE_XUAT_SAC); // 11,550,000
        }

        // Giỏi: Điểm 8.0-8.99 VÀ ĐRL >= 80
        if (diemHocTap >= 8.0 && diemHocTap < 9.0 && diemDRL >= 80)
        {
            return ("Gioi", MUC_SAN * TY_LE_GIOI); // 9,900,000
        }

        // Khá: Điểm 6.5-7.99 VÀ ĐRL >= 70
        if (diemHocTap >= 6.5 && diemHocTap < 8.0 && diemDRL >= 70)
        {
            return ("Kha", MUC_SAN * TY_LE_KHA); // 8,250,000
        }

        // Không đủ điều kiện
        return ("KhongDuDieuKien", 0);
    }

    public async Task<ChotDeXuatResponseDTO> ChotDanhSachDeXuatAsync(int maTaiKhoan, ChotDeXuatRequestDTO request)
    {
        // Bước 1: Tìm cán bộ và lấy MaKhoa
        var canBo = await _context.CanBos
            .FirstOrDefaultAsync(cb => cb.MaTK == maTaiKhoan);

        if (canBo == null || canBo.MaKhoa == null)
        {
            throw new Exception("Khong tim thay thong tin can bo hoac khoa");
        }

        // Bước 2: Validate danh sách hồ sơ
        if (request.DanhSachMaHoSo == null || !request.DanhSachMaHoSo.Any())
        {
            throw new Exception("Danh sach ho so khong duoc rong");
        }

        // Bước 3: Gọi repository để cập nhật trạng thái
        var soLuongDaChot = await _hoSoRepository.ChotDanhSachDeXuatAsync(
            canBo.MaKhoa.Value,
            request.MaDot,
            request.DanhSachMaHoSo,
            canBo.MaCB
        );

        // Bước 4: Trả về kết quả
        return new ChotDeXuatResponseDTO
        {
            SoLuongDaChot = soLuongDaChot,
            DanhSachMaHoSo = request.DanhSachMaHoSo
        };
    }
}
