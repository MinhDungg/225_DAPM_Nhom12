using BE.Data;
using BE.Models;
using BE.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.Repositories.Implementations
{
    public class HoSoXetHocBongRepository : IHoSoXetHocBongRepository
    {
        private readonly AppDbContext _context;

        public HoSoXetHocBongRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HoSoXetHocBong>> GetProfilesByStatusAsync(string status)
        {
            return await _context.HoSoXetHocBongs
                .Include(app => app.SinhVien) // Lấy thông tin sinh viên kèm theo
                .Where(app => app.TrangThai == status)
                .ToListAsync();
        }

        public async Task<bool> UpdateProfilesStatusAsync(List<int> profileIds, string newStatus)
        {
            var applications = await _context.HoSoXetHocBongs
                .Where(app => profileIds.Contains(app.MaHoSo))
                .ToListAsync();

            if (!applications.Any()) return false;

            foreach (var app in applications)
            {
                app.TrangThai = newStatus; // Chỗ này giữ nguyên tiếng Việt vì DB thiết kế cột tên là TrangThai
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
