namespace BE.DTOs.Response;

public class DotHocBongResponseDTO
{
    public int MaDot { get; set; }
    public string LoaiDot { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public string? TrangThai { get; set; }

    /// <summary>True nếu đã có dữ liệu điểm (KetQuaHocTap) cho học kỳ/năm học này.</summary>
    public bool DaCoDiem { get; set; }

    /// <summary>True nếu đã có ít nhất 1 bản ghi phân bổ kinh phí (PhanBoKinhPhi) cho đợt này.</summary>
    public bool DaCoKinhPhi { get; set; }
}
