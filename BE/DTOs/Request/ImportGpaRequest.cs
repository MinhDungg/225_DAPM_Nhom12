namespace BE.DTOs.Request;

public class ImportGpaRequest
{
    public string MaSV { get; set; } = null!;
    public int HocKy { get; set; }
    public string NamHoc { get; set; } = null!;
    public double GPA { get; set; }
    public int SoTC { get; set; }
}

