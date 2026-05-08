using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IKhoaService
{
    Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoDuyetAsync(int maTaiKhoan);
    Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachChoXetTheoDotAsync(int maTaiKhoan, int maDot);
    Task<XepHangResponseDTO> XepHangVaPhanBoAsync(int maTaiKhoan, XepHangRequestDTO request);
    Task<ChotDeXuatResponseDTO> ChotDanhSachDeXuatAsync(int maTaiKhoan, ChotDeXuatRequestDTO request);
    Task<List<HoSoChoDuyetResponseDTO>> LayDanhSachDaDeXuatAsync(int maTaiKhoan);
    Task<PhanBoKinhPhiResponseDTO?> LayPhanBoKinhPhiAsync(int maTaiKhoan, int maDot);
}
