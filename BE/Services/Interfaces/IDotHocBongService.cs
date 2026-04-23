using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IDotHocBongService
{
    Task<DotHocBongResponseDTO> CreateDotHocBongAsync(DotHocBongCreateDTO request);
    Task<DotHocBongResponseDTO?> UpdateDotHocBongAsync(int maDot, DotHocBongUpdateDTO request);
    Task<bool> DeleteDotHocBongAsync(int maDot);
    Task<AutoScanResultDTO?> AutoScanCandidatesAsync(int maDot);
    Task<IEnumerable<DotHocBongResponseDTO>> GetAllDotHocBongAsync();
    Task<List<UngVienResponseDTO>> GetDanhSachUngVienAsync(int maDot);
}
