using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IDiemService
{
    Task<ImportResultDTO> ImportGpaAsync(List<ImportGpaRequest> requests);
    Task<ImportResultDTO> ImportDrlAsync(List<ImportDrlRequest> requests);
}

