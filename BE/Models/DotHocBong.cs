namespace BE.Models;

public class DotHocBong
{
    public int MaDot { get; set; }
    public string LoaiDot { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public string? TrangThai { get; set; }

    public ICollection<HoSoXetHocBong> HoSoXetHocBongs { get; set; } = new List<HoSoXetHocBong>();
    public ICollection<DSHocBong> DSHocBongs { get; set; } = new List<DSHocBong>();
}
