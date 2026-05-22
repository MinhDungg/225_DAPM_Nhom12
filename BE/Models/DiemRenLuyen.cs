namespace BE.Models;

public class DiemRenLuyen
{
    public int MaDRL { get; set; }
    public string MaSV { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public int DiemSo { get; set; }
    public int? MaCB_Nhap { get; set; }

    public SinhVien SinhVien { get; set; } = null!;
    public CanBo? CanBoNhap { get; set; }
}
