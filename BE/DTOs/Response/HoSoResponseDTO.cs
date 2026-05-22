using System;

namespace BE.DTOs.Response
{
    public class HoSoResponseDTO
    {
        public int MaHoSo { get; set; }
        public string? MaSV { get; set; }
        public string? HoTen { get; set; }       
        public string? TenLop { get; set; }  
        public string? TenKhoa { get; set; }    
        public double GPA { get; set; }
        public double DiemHocTap { get; set; }
        public double DiemRenLuyen { get; set; }
        public string? XepLoaiHB { get; set; }
        public string? TrangThai { get; set; }
        public decimal? MucHocBong { get; set; }
        public string? LoaiDot { get; set; }
        public int? HocKy { get; set; }
        public string? NamHoc { get; set; }
        public DateTime? NgayNop { get; set; }
        public string? GhiChu { get; set; }
    }
}
