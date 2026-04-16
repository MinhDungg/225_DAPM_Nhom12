using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IDotHocBongService
{
    Task<DotHocBongResponseDTO> CreateDotHocBongAsync(DotHocBongCreateDTO request);
    Task<AutoScanResultDTO?> AutoScanCandidatesAsync(int maDot);
}
