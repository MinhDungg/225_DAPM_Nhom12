public class HoSoResponseDTO
{
    public int MaHoSo { get; set; }
    public string MaSV { get; set; } = null!;
    public string? HoTen { get; set; }
    public string? TenLop { get; set; }
    public string? TenKhoa { get; set; }
    public double GPA { get; set; }
    public double DiemHocTap { get; set; }
    public int DiemRenLuyen { get; set; }
    public bool CoDiemF { get; set; }
    public string? XepLoaiHB { get; set; }
    public decimal SoTien { get; set; }
    public string? TrangThai { get; set; }
}