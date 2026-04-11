using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IKhoaService
{
    Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan);
}
