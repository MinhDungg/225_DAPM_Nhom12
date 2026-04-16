namespace BE.DTOs.Response;

public class SinhVienXepHangDTO
{
    public int ThuHang { get; set; }
    public int MaHoSo { get; set; }
    public string MaSV { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public string TenLop { get; set; } = null!;
    public double GPA { get; set; }
    public int DiemRenLuyen { get; set; }
    public string XepLoai { get; set; } = null!; // XuatSac, Gioi, Kha
    public decimal MucHocBong { get; set; }
    public bool DuocNhan { get; set; }
}
