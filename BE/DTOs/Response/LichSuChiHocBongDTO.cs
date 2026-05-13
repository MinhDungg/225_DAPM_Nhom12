namespace BE.DTOs.Response
{
    public class LichSuChiHocBongDTO
    {
        public int MaDot { get; set; }
        public string LoaiDot { get; set; } = null!;
        public int HocKy { get; set; }
        public string NamHoc { get; set; } = null!;
        public int SoSinhVien { get; set; }
        public decimal TongChi { get; set; }
        public string TrangThai { get; set; } = null!;
    }
}
