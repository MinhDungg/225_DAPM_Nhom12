namespace BE.DTOs.Response;

public class UngVienDiemDTO
{
    public string MaSV { get; set; } = null!;
    public float GPA { get; set; }
    public float DiemHocTap { get; set; }
    public int SoTC { get; set; }
    public bool CoDiemF { get; set; }
    public int DiemRenLuyen { get; set; }
}
