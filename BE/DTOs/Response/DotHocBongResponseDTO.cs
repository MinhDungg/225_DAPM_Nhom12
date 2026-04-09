namespace BE.DTOs.Response;

public class DotHocBongResponseDTO
{
    public int MaDot { get; set; }
    public string LoaiDot { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public string? TrangThai { get; set; }
}
