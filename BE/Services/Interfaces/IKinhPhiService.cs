using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IKinhPhiService
{
    Task<PhanBoKinhPhiResponseDTO?> ThietLapKinhPhiAsync(ThietLapKinhPhiRequest request);

    /// <summary>Lấy danh sách phân bổ kinh phí đã lưu của một đợt.</summary>
    Task<List<PhanBoKinhPhiResponseDTO>> LayPhanBoTheoMaDotAsync(int maDot);
}
