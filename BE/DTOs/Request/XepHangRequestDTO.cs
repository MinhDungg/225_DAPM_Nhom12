namespace BE.DTOs.Request;

public class ChiTietKhoaHocDTO
{
    public string TenKhoa { get; set; } = null!;
    public int SoLuongSinhVien { get; set; }
}

public class XepHangRequestDTO
{
    public int MaDot { get; set; }
    /// <summary>Tổng ngân sách Khoa tự nhập (không lấy từ KHTC)</summary>
    public decimal TongNganSach { get; set; }
    /// <summary>Mức học bổng loại Khá (chuẩn tính các loại khác)</summary>
    public decimal MucHocBongKha { get; set; }
    /// <summary>Quân số từng Khóa học do Trưởng Khoa hiệu chỉnh</summary>
    public List<ChiTietKhoaHocDTO> ThongKeKhoaHoc { get; set; } = new();
}
