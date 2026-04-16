namespace BE.DTOs.Request;

public class ChotDeXuatRequestDTO
{
    public int MaDot { get; set; }
    public List<int> DanhSachMaHoSo { get; set; } = new List<int>();
}
