namespace BE.Models;

public class SinhVien
{
    public string MaSV { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string Email { get; set; } = null!;
    public string? SDT { get; set; }
    public int MaLop { get; set; }
    public int? MaTK { get; set; }

    public Lop Lop { get; set; } = null!;
    public TaiKhoan? TaiKhoan { get; set; }

    public ICollection<KetQuaHocTap> KetQuaHocTaps { get; set; } = new List<KetQuaHocTap>();
    public ICollection<DiemRenLuyen> DiemRenLuyens { get; set; } = new List<DiemRenLuyen>();
    public ICollection<HoSoXetHocBong> HoSoXetHocBongs { get; set; } = new List<HoSoXetHocBong>();
    public ICollection<DSHocBong> DSHocBongs { get; set; } = new List<DSHocBong>();
}
