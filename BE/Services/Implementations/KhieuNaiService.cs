using BE.DTOs.Request;
using BE.DTOs.Response;
using BE.Models;
using BE.Repositories.Interfaces;
using BE.Services.Interfaces;

namespace BE.Services.Implementations;

public class KhieuNaiService : IKhieuNaiService
{
    private readonly IKhieuNaiRepository _khieuNaiRepo;
    private readonly IHoSoXetHocBongRepository _hoSoRepo;

    public KhieuNaiService(IKhieuNaiRepository khieuNaiRepo, IHoSoXetHocBongRepository hoSoRepo)
    {
        _khieuNaiRepo = khieuNaiRepo;
        _hoSoRepo = hoSoRepo;
    }

    public async Task<BaseResponse<KhieuNaiResponseDTO>> TaoKhieuNaiAsync(string maSV, TaoKhieuNaiRequestDTO request)
    {
        // 1. Kiểm tra hồ sơ có tồn tại và thuộc về sinh viên này không
        var hoSo = await _hoSoRepo.GetByIdAsync(request.MaHoSo);
        if (hoSo == null || hoSo.MaSV != maSV)
        {
            return new BaseResponse<KhieuNaiResponseDTO> { Success = false, Message = "Hồ sơ không hợp lệ hoặc không thuộc về bạn." };
        }

        // 2. Map DTO sang Entity
        var khieuNai = new KhieuNai
        {
            MaHoSo = request.MaHoSo,
            NoiDung = request.NoiDung,
            MinhChung = request.MinhChung,
            NgayGui = DateTime.Now,
            TrangThai = "ChoXuLy"
        };

        await _khieuNaiRepo.AddAsync(khieuNai);

        return new BaseResponse<KhieuNaiResponseDTO>
        {
            Success = true,
            Message = "Gửi khiếu nại thành công.",
            Data = MapToResponseDTO(khieuNai)
        };
    }

    public async Task<BaseResponse<KhieuNaiResponseDTO>> PhanHoiKhieuNaiAsync(int maKhieuNai, int maCBDuyet, PhanHoiKhieuNaiRequestDTO request)
    {
        // 1. Kiểm tra khiếu nại - dùng ForUpdate để EF track entity
        var khieuNai = await _khieuNaiRepo.GetByIdForUpdateAsync(maKhieuNai);
        if (khieuNai == null)
        {
            return new BaseResponse<KhieuNaiResponseDTO> { Success = false, Message = "Không tìm thấy khiếu nại." };
        }

        if (khieuNai.TrangThai == "DaXuLy")
        {
            return new BaseResponse<KhieuNaiResponseDTO> { Success = false, Message = "Khiếu nại này đã được xử lý trước đó." };
        }

        // 2. Cập nhật thông tin phản hồi
        khieuNai.NoiDungPhanHoi = request.NoiDungPhanHoi;
        khieuNai.NgayPhanHoi = DateTime.Now;
        khieuNai.TrangThai = "DaXuLy";
        khieuNai.MaCB_Duyet = maCBDuyet;

        await _khieuNaiRepo.UpdateAsync(khieuNai);

        return new BaseResponse<KhieuNaiResponseDTO>
        {
            Success = true,
            Message = "Phản hồi khiếu nại thành công.",
            Data = MapToResponseDTO(khieuNai)
        };
    }

    public async Task<BaseResponse<IEnumerable<KhieuNaiResponseDTO>>> LaysDSKhieuNaiCuaSinhVienAsync(string maSV)
    {
        var list = await _khieuNaiRepo.GetByMaSVAsync(maSV);
        return new BaseResponse<IEnumerable<KhieuNaiResponseDTO>>
        {
            Success = true,
            Message = "Lấy dữ liệu thành công.",
            Data = list.Select(MapToResponseDTO)
        };
    }

    public async Task<BaseResponse<IEnumerable<KhieuNaiResponseDTO>>> LayTatCaKhieuNaiAsync()
    {
        var list = await _khieuNaiRepo.GetAllAsync();
        return new BaseResponse<IEnumerable<KhieuNaiResponseDTO>>
        {
            Success = true,
            Message = "Lấy dữ liệu thành công.",
            Data = list.Select(MapToResponseDTO)
        };
    }

    // Hàm phụ trợ Mapping
    private KhieuNaiResponseDTO MapToResponseDTO(KhieuNai k)
    {
        return new KhieuNaiResponseDTO
        {
            MaKhieuNai = k.MaKhieuNai,
            MaHoSo = k.MaHoSo,
            NoiDung = k.NoiDung,
            MinhChung = k.MinhChung,
            NgayGui = k.NgayGui,
            TrangThai = k.TrangThai,
            NoiDungPhanHoi = k.NoiDungPhanHoi,
            NgayPhanHoi = k.NgayPhanHoi,
            NguoiPhanHoi = k.CanBoDuyet?.HoTen
        };
    }
}