namespace BE.DTOs.Response
{
    public class HoSoResponseDTO
    {
        public int MaHoSo { get; set; }
        public string? MaSV { get; set; }
        public string? HoTen { get; set; }       
        public string? TenLop { get; set; }      
        public double GPA { get; set; }
        public double DiemNCKH { get; set; }
        public double DiemHDCD { get; set; }
        public string? XepLoaiHB { get; set; }
        public string? TrangThai { get; set; }
    }
}
