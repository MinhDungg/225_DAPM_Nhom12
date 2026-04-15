using Microsoft.EntityFrameworkCore.Storage;

namespace BE.Repositories.Interfaces;

public interface IUnitOfWork
{
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task<int> SaveChangesAsync();
}

