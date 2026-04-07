namespace BE.Models;

public class Khoa
{
    public int MaKhoa { get; set; }
    public string TenKhoa { get; set; } = null!;

    public ICollection<Lop> Lops { get; set; } = new List<Lop>();
}
