namespace BE.DTOs.Response;

public class HoSoChoDuyetResponseDTO
{
    public int MaHoSo { get; set; }
    public string MaSV { get; set; } = null!;
    public string HoTenSinhVien { get; set; } = null!;
    public string TenLop { get; set; } = null!;
    public float DiemHocTap { get; set; } // Điểm học tập thang 10
    public float GPA { get; set; }
    public int DiemRenLuyen { get; set; }
    public string? XepLoaiHB { get; set; }
    public decimal? MucHocBong { get; set; } // Thêm mức học bổng
    public double DiemNCKH { get; set; }
    public double DiemHDCD { get; set; }
    public DateTime NgayNop { get; set; }
    public string TrangThai { get; set; } = null!;
}
