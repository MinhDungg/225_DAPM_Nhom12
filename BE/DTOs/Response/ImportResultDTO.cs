using System.Text.Json.Serialization;

namespace BE.DTOs.Response;

public class ImportResultDTO
{
    [JsonPropertyName("thanhCong")]
    public int ThanhCong { get; set; }

    [JsonPropertyName("thatBai")]
    public int ThatBai { get; set; }

    [JsonPropertyName("danhSachLoi")]
    public List<string> DanhSachLoi { get; set; } = new();
}
