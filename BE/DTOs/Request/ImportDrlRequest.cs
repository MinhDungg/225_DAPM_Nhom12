namespace BE.DTOs.Request;

public class ImportDrlRequest
{
    public string MaSV { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public int DiemSo { get; set; }
}

