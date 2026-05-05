using System.Collections.Generic;

namespace BE.DTOs.Response
{
    public class ThongTinDotDTO
    {
        public string LoaiDot { get; set; } = null!;
        public int HocKy { get; set; }
        public string NamHoc { get; set; } = null!;
        public string? TrangThai { get; set; }
        public string? LyDoTraVe { get; set; }
    }

    public class TongHopHieuTruongResponseDTO
    {
        public ThongTinDotDTO ThongTinDot { get; set; } = null!;
        public int TongSinhVien { get; set; }
        public decimal TongKinhPhi { get; set; }
        public IEnumerable<HoSoResponseDTO> DanhSach { get; set; } = new List<HoSoResponseDTO>();
    }
}