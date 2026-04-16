namespace BE.Repositories.Interfaces;

public interface IKhoaRepository
{
    Task<bool> TonTaiAsync(int maKhoa);
}

