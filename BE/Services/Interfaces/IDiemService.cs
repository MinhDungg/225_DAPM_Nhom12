using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IDiemService
{
    Task<ImportResultDTO> ImportDuLieuHocVuAsync(List<ImportHocVuRequest> requests);
    Task<IEnumerable<DuLieuHocVuResponseDTO>> GetDanhSachHocVuAsync(int? hocKy, string? namHoc);
}
