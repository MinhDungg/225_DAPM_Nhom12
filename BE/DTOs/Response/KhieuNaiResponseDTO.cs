namespace BE.DTOs.Response;

public class KhieuNaiResponseDTO
{
    public int MaKhieuNai { get; set; }
    public int MaHoSo { get; set; }
    public string NoiDung { get; set; } = null!;
    public string? MinhChung { get; set; }
    public DateTime NgayGui { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? NoiDungPhanHoi { get; set; }
    public DateTime? NgayPhanHoi { get; set; }
    public string? NguoiPhanHoi { get; set; } // Tên cán bộ phản hồi
}