namespace BE.DTOs.Request;

public class TaoKhieuNaiRequestDTO
{
    public int MaHoSo { get; set; }
    public string NoiDung { get; set; } = null!;
    public string? MinhChung { get; set; }
}

public class PhanHoiKhieuNaiRequestDTO
{
    public string NoiDungPhanHoi { get; set; } = null!;
}