namespace BE.Models;

public class KetQuaHocTap
{
    public int MaDiem { get; set; }
    public string MaSV { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public float GPA { get; set; }
    public float DiemHocTap { get; set; }
    public int SoTC { get; set; }
    public bool CoDiemF { get; set; }
    public int? MaCB_Nhap { get; set; }

    public SinhVien SinhVien { get; set; } = null!;
    public CanBo? CanBoNhap { get; set; }
}
