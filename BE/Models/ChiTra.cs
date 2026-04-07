namespace BE.Models;

public class ChiTra
{
    public int MaChiTra { get; set; }
    public int MaHoSo { get; set; }
    public decimal SoTien { get; set; }
    public DateTime? NgayXacNhan { get; set; }
    public string TrangThai { get; set; } = null!;
    public int? MaCB_GiaiNgan { get; set; }

    public HoSoXetHocBong HoSoXetHocBong { get; set; } = null!;
    public CanBo? CanBoGiaiNgan { get; set; }
}
