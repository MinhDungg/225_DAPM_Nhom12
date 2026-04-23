namespace BE.DTOs.Response;

public class UngVienResponseDTO
{
    public string MaSV { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public float GPA { get; set; }
    public float DiemHocTap { get; set; }
    public int DiemRenLuyen { get; set; }
    public string? GhiChu { get; set; }
    public string TrangThai { get; set; } = null!;
}
