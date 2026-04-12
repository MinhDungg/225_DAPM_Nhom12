namespace BE.DTOs.Request;

public class DotHocBongCreateDTO
{
    public string LoaiDot { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
}
