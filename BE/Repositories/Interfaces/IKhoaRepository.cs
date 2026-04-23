namespace BE.Repositories.Interfaces;

public interface IKhoaRepository
{
    Task<bool> TonTaiAsync(int maKhoa);
    Task<List<(int MaKhoa, string TenKhoa)>> LayTatCaAsync();
}

