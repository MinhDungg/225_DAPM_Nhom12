namespace BE.Models;

public class TaiKhoan
{
    public int MaTK { get; set; }
    public string TenDangNhap { get; set; } = null!;
    public string MatKhau { get; set; } = null!;
    public string VaiTro { get; set; } = null!;
    public bool TrangThai { get; set; }

    public SinhVien? SinhVien { get; set; }
    public CanBo? CanBo { get; set; }
}
