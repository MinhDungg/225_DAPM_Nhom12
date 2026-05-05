using System;

namespace BE.DTOs.Response;

public class SinhVienProfileDTO
{
    public string MaSV { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public DateTime? NgaySinh { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? SDT { get; set; }
    public string TenLop { get; set; } = string.Empty;
    public string TenKhoa { get; set; } = string.Empty;
    public float? GPA { get; set; }
    public int TinChiKyXet { get; set; }
}
