namespace BE.Models;

public class PhongBan
{
    public int MaPhong { get; set; }
    public string TenPhong { get; set; } = null!;

    public ICollection<CanBo> CanBos { get; set; } = new List<CanBo>();
}
