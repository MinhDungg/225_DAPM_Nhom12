namespace BE.DTOs.Response;

public class XepHangResponseDTO
{
    public decimal TongNganSach { get; set; }
    public decimal TongChiTieu { get; set; }
    public int SoLuongDuocNhan { get; set; }
    public int TongSoHoSo { get; set; }
    public List<SinhVienXepHangDTO> DanhSachXepHang { get; set; } = new List<SinhVienXepHangDTO>();
}
