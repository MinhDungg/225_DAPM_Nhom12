namespace BE.Models;

public class CanBo
{
    public int MaCB { get; set; }
    public string HoTen { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ChucVu { get; set; }
    public int? MaPhong { get; set; }
    public int? MaTK { get; set; }

    public PhongBan? PhongBan { get; set; }
    public TaiKhoan? TaiKhoan { get; set; }

    public ICollection<KetQuaHocTap> KetQuaHocTaps { get; set; } = new List<KetQuaHocTap>();
    public ICollection<DiemRenLuyen> DiemRenLuyens { get; set; } = new List<DiemRenLuyen>();
    public ICollection<HoSoXetHocBong> HoSoXetHocBongs { get; set; } = new List<HoSoXetHocBong>();
    public ICollection<KhieuNai> KhieuNais { get; set; } = new List<KhieuNai>();
    public ICollection<DSHocBong> DSHocBongs { get; set; } = new List<DSHocBong>();
    public ICollection<ChiTra> ChiTras { get; set; } = new List<ChiTra>();
}
