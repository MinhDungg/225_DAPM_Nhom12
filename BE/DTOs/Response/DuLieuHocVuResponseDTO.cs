namespace BE.DTOs.Response
{
    public class DuLieuHocVuResponseDTO
    {
        public string MaSV { get; set; } = null!;
        public string HoTen { get; set; } = null!;
        public string TenLop { get; set; } = null!;
        public int HocKy { get; set; }
        public string NamHoc { get; set; } = null!;
        public float GPA { get; set; }
        public float DiemHocTap { get; set; }
        public int SoTC { get; set; }
        public bool CoDiemF { get; set; }
    }
}
