namespace BE.Models;

public class KhieuNai
{
    public int MaKhieuNai { get; set; }
    public int MaHoSo { get; set; }
    public string NoiDung { get; set; } = null!;
    public string? MinhChung { get; set; }
    public DateTime NgayGui { get; set; }
    public string TrangThai { get; set; } = null!;
    public int? MaCB_Duyet { get; set; }

    public HoSoXetHocBong HoSoXetHocBong { get; set; } = null!;
    public CanBo? CanBoDuyet { get; set; }
}
