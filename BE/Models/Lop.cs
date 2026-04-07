namespace BE.Models;

public class Lop
{
    public int MaLop { get; set; }
    public string TenLop { get; set; } = null!;
    public int MaKhoa { get; set; }

    public Khoa Khoa { get; set; } = null!;
    public ICollection<SinhVien> SinhViens { get; set; } = new List<SinhVien>();
}
