namespace BE.DTOs.Response;

public class ImportResultDTO
{
    public int ThanhCong { get; set; }
    public int ThatBai { get; set; }
    public List<string> DanhSachLoi { get; set; } = new();
}

