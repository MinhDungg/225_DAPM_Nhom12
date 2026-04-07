namespace BE.Models;

public class DSHocBong
{
    public int MaDS { get; set; }
    public int MaDot { get; set; }
    public string MaSV { get; set; } = null!;
    public string? XepLoai { get; set; }
    public decimal SoTien { get; set; }
    public DateTime NgayPheDuyet { get; set; }
    public int MaCB_PheDuyet { get; set; }

    public DotHocBong DotHocBong { get; set; } = null!;
    public SinhVien SinhVien { get; set; } = null!;
    public CanBo CanBoPheDuyet { get; set; } = null!;
}
