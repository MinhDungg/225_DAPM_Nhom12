using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IKinhPhiService
{
    Task<PhanBoKinhPhiResponseDTO?> ThietLapKinhPhiAsync(ThietLapKinhPhiRequest request);
}

