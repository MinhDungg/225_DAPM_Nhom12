namespace BE.DTOs.Request;

public class HoSoDeXuatItemDTO
{
    public int MaHoSo { get; set; }
    public decimal? MucHocBong { get; set; }
}

public class ChotDeXuatRequestDTO
{
    public int MaDot { get; set; }
    public List<HoSoDeXuatItemDTO> DanhSachDeXuat { get; set; } = new List<HoSoDeXuatItemDTO>();
}
