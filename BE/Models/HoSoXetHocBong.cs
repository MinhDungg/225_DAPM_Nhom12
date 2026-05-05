namespace BE.Models;

public class HoSoXetHocBong
{
    public int MaHoSo { get; set; }
    public string MaSV { get; set; } = null!;
    public int MaDot { get; set; }
    public DateTime NgayNop { get; set; }
    public float GPA { get; set; }
    public float DiemHocTap { get; set; }
    public int DiemRenLuyen { get; set; }
    public string? XepLoaiHB { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? GhiChu { get; set; }
    public int? MaCB_Duyet { get; set; }

    public SinhVien SinhVien { get; set; } = null!;
    public DotHocBong DotHocBong { get; set; } = null!;
    public CanBo? CanBoDuyet { get; set; }

    public ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();
    public ICollection<ChiTra> ChiTras { get; set; } = new List<ChiTra>();
}
