namespace BE.Models;

public class PhanBoKinhPhi
{
    public int MaPhanBo { get; set; }
    public int MaDot { get; set; }
    public int MaKhoa { get; set; }
    public decimal KinhPhi { get; set; }
    public decimal MucHBLoaiKha { get; set; }

    public DotHocBong DotHocBong { get; set; } = null!;
    public Khoa Khoa { get; set; } = null!;
}

