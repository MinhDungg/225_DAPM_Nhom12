namespace BE.DTOs.Response;

public class HoSoChoDuyetResponseDTO
{
    public int MaHoSo { get; set; }
    public string MaSV { get; set; } = null!;
    public string HoTenSinhVien { get; set; } = null!;
    public string TenLop { get; set; } = null!;
    public double GPA { get; set; }
    public int DiemRenLuyen { get; set; }
    public double DiemNCKH { get; set; }
    public double DiemHDCD { get; set; }
    public DateTime NgayNop { get; set; }
    public string TrangThai { get; set; } = null!;
}
