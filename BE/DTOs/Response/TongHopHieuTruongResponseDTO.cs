using System.Collections.Generic;

namespace BE.DTOs.Response
{
    public class ThongTinDotDTO
    {
        public int MaDot { get; set; }
        public string LoaiDot { get; set; } = null!;
        public int HocKy { get; set; }
        public string NamHoc { get; set; } = null!;
        public string? TrangThai { get; set; }
        public string? LyDoTraVe { get; set; }      // Lý do HT trả về
    }

    public class TongHopHieuTruongResponseDTO
    {
        public ThongTinDotDTO ThongTinDot { get; set; } = null!;
        public int TongSinhVien { get; set; }
        public decimal TongKinhPhi { get; set; }
        public decimal TongTienDaChi { get; set; } // Tổng tiền đã chi trong lịch sử
        public IEnumerable<HoSoResponseDTO> DanhSach { get; set; } = new List<HoSoResponseDTO>();
    }
}