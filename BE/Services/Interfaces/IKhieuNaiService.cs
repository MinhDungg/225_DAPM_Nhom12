using BE.DTOs.Request;
using BE.DTOs.Response;

namespace BE.Services.Interfaces;

public interface IKhieuNaiService
{
    Task<BaseResponse<KhieuNaiResponseDTO>> TaoKhieuNaiAsync(string maSV, TaoKhieuNaiRequestDTO request);
    Task<BaseResponse<KhieuNaiResponseDTO>> PhanHoiKhieuNaiAsync(int maKhieuNai, int maCBDuyet, PhanHoiKhieuNaiRequestDTO request);
    Task<BaseResponse<IEnumerable<KhieuNaiResponseDTO>>> LaysDSKhieuNaiCuaSinhVienAsync(string maSV);
    Task<BaseResponse<IEnumerable<KhieuNaiResponseDTO>>> LayTatCaKhieuNaiAsync();
}