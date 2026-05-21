namespace BE.DTOs.Response;

public class ChotDeXuatResponseDTO
{
    public int SoLuongDaChot { get; set; }
    public List<int> DanhSachMaHoSo { get; set; } = new List<int>();
}

