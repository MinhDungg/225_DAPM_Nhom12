using BE.Models;
using Microsoft.EntityFrameworkCore;

namespace BE.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaiKhoan> TaiKhoans => Set<TaiKhoan>();
    public DbSet<PhongBan> PhongBans => Set<PhongBan>();
    public DbSet<CanBo> CanBos => Set<CanBo>();
    public DbSet<Khoa> Khoas => Set<Khoa>();
    public DbSet<Lop> Lops => Set<Lop>();
    public DbSet<SinhVien> SinhViens => Set<SinhVien>();
    public DbSet<KetQuaHocTap> KetQuaHocTaps => Set<KetQuaHocTap>();
    public DbSet<DiemRenLuyen> DiemRenLuyens => Set<DiemRenLuyen>();
    public DbSet<DotHocBong> DotHocBongs => Set<DotHocBong>();
    public DbSet<PhanBoKinhPhi> PhanBoKinhPhis => Set<PhanBoKinhPhi>();
    public DbSet<HoSoXetHocBong> HoSoXetHocBongs => Set<HoSoXetHocBong>();
    public DbSet<KhieuNai> KhieuNais => Set<KhieuNai>();
    public DbSet<DSHocBong> DSHocBongs => Set<DSHocBong>();
    public DbSet<ChiTra> ChiTras => Set<ChiTra>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.ToTable("TAIKHOAN");
            entity.HasKey(e => e.MaTK);
            entity.Property(e => e.MaTK).ValueGeneratedOnAdd();
            entity.Property(e => e.TenDangNhap)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.HasIndex(e => e.TenDangNhap).IsUnique();
            entity.Property(e => e.MatKhau)
                .IsRequired()
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.VaiTro)
                .IsRequired()
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TrangThai)
                .HasDefaultValue(true);

            entity.HasOne(e => e.SinhVien)
                .WithOne(e => e.TaiKhoan)
                .HasForeignKey<SinhVien>(e => e.MaTK)
                .IsRequired(false);

            entity.HasOne(e => e.CanBo)
                .WithOne(e => e.TaiKhoan)
                .HasForeignKey<CanBo>(e => e.MaTK)
                .IsRequired(false);
        });

        modelBuilder.Entity<PhongBan>(entity =>
        {
            entity.ToTable("PHONGBAN");
            entity.HasKey(e => e.MaPhong);
            entity.Property(e => e.MaPhong).ValueGeneratedOnAdd();
            entity.Property(e => e.TenPhong)
                .IsRequired()
                .HasMaxLength(150);
        });

        modelBuilder.Entity<CanBo>(entity =>
        {
            entity.ToTable("CANBO");
            entity.HasKey(e => e.MaCB);
            entity.Property(e => e.MaCB).ValueGeneratedOnAdd();
            entity.Property(e => e.HoTen)
                .IsRequired()
                .HasMaxLength(150);
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.ChucVu)
                .HasMaxLength(100);
            entity.HasIndex(e => e.MaTK).IsUnique();

            entity.HasOne(e => e.PhongBan)
                .WithMany(e => e.CanBos)
                .HasForeignKey(e => e.MaPhong);

            entity.HasOne(e => e.Khoa)
                .WithMany(e => e.CanBos)
                .HasForeignKey(e => e.MaKhoa);
        });

        modelBuilder.Entity<Khoa>(entity =>
        {
            entity.ToTable("KHOA");
            entity.HasKey(e => e.MaKhoa);
            entity.Property(e => e.MaKhoa).ValueGeneratedOnAdd();
            entity.Property(e => e.TenKhoa)
                .IsRequired()
                .HasMaxLength(150);
        });

        modelBuilder.Entity<Lop>(entity =>
        {
            entity.ToTable("LOP");
            entity.HasKey(e => e.MaLop);
            entity.Property(e => e.MaLop).ValueGeneratedOnAdd();
            entity.Property(e => e.TenLop)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasOne(e => e.Khoa)
                .WithMany(e => e.Lops)
                .HasForeignKey(e => e.MaKhoa);
        });

        modelBuilder.Entity<SinhVien>(entity =>
        {
            entity.ToTable("SINHVIEN");
            entity.HasKey(e => e.MaSV);
            entity.Property(e => e.MaSV)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.HoTen)
                .IsRequired()
                .HasMaxLength(150);
            entity.Property(e => e.NgaySinh)
                .HasColumnType("date");
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SDT)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.HasIndex(e => e.MaTK).IsUnique();

            entity.HasOne(e => e.Lop)
                .WithMany(e => e.SinhViens)
                .HasForeignKey(e => e.MaLop);
        });

        modelBuilder.Entity<KetQuaHocTap>(entity =>
        {
            entity.ToTable("KETQUAHOCTAP");
            entity.HasKey(e => e.MaDiem);
            entity.Property(e => e.MaDiem).ValueGeneratedOnAdd();
            entity.Property(e => e.MaSV)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.HocKy)
                .IsRequired();
            entity.Property(e => e.NamHoc)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.GPA)
                .IsRequired()
                .HasColumnType("real");
            entity.Property(e => e.DiemHocTap)
                .IsRequired()
                .HasColumnType("real");
            entity.Property(e => e.SoTC)
                .IsRequired();
            entity.Property(e => e.CoDiemF)
                .IsRequired()
                .HasDefaultValue(false);

            entity.HasOne(e => e.SinhVien)
                .WithMany(e => e.KetQuaHocTaps)
                .HasForeignKey(e => e.MaSV);

            entity.HasOne(e => e.CanBoNhap)
                .WithMany(e => e.KetQuaHocTaps)
                .HasForeignKey(e => e.MaCB_Nhap);
        });

        modelBuilder.Entity<DiemRenLuyen>(entity =>
        {
            entity.ToTable("DIEMRENLUYEN");
            entity.HasKey(e => e.MaDRL);
            entity.Property(e => e.MaDRL).ValueGeneratedOnAdd();
            entity.Property(e => e.MaSV)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.HocKy)
                .IsRequired();
            entity.Property(e => e.NamHoc)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.DiemSo)
                .IsRequired();

            entity.HasOne(e => e.SinhVien)
                .WithMany(e => e.DiemRenLuyens)
                .HasForeignKey(e => e.MaSV);

            entity.HasOne(e => e.CanBoNhap)
                .WithMany(e => e.DiemRenLuyens)
                .HasForeignKey(e => e.MaCB_Nhap);
        });

        modelBuilder.Entity<DotHocBong>(entity =>
        {
            entity.ToTable("DOTHOCBONG");
            entity.HasKey(e => e.MaDot);
            entity.Property(e => e.MaDot).ValueGeneratedOnAdd();
            entity.Property(e => e.LoaiDot)
                .IsRequired()
                .HasMaxLength(150);
            entity.Property(e => e.HocKy)
                .IsRequired();
            entity.Property(e => e.NamHoc)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("KhoiTao");
            entity.Property(e => e.LyDoTraVe)
                .HasColumnType("nvarchar(max)")
                .IsRequired(false);
        });

        modelBuilder.Entity<PhanBoKinhPhi>(entity =>
        {
            entity.ToTable("PHANBOKINHPHI");
            entity.HasKey(e => e.MaPhanBo);
            entity.Property(e => e.MaPhanBo).ValueGeneratedOnAdd();
            entity.Property(e => e.KinhPhi)
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.MucHBLoaiKha)
                .HasColumnType("decimal(18,2)");
            entity.HasIndex(e => new { e.MaDot, e.MaKhoa }).IsUnique();

            entity.HasOne(e => e.DotHocBong)
                .WithMany(e => e.PhanBoKinhPhis)
                .HasForeignKey(e => e.MaDot);

            entity.HasOne(e => e.Khoa)
                .WithMany(e => e.PhanBoKinhPhis)
                .HasForeignKey(e => e.MaKhoa);
        });

        modelBuilder.Entity<HoSoXetHocBong>(entity =>
        {
            entity.ToTable("HOSOXETHOCBONG");
            entity.HasKey(e => e.MaHoSo);
            entity.Property(e => e.MaHoSo).ValueGeneratedOnAdd();
            entity.Property(e => e.MaSV)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.NgayNop)
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.GPA)
                .IsRequired()
                .HasColumnType("real");
            entity.Property(e => e.DiemHocTap)
                .IsRequired()
                .HasColumnType("real");
            entity.Property(e => e.DiemRenLuyen)
                .IsRequired();
            entity.Property(e => e.XepLoaiHB)
                .HasMaxLength(50);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("ChoXet");
            entity.Property(e => e.GhiChu)
                .HasColumnType("nvarchar(max)")
                .IsRequired(false);

            entity.HasOne(e => e.SinhVien)
                .WithMany(e => e.HoSoXetHocBongs)
                .HasForeignKey(e => e.MaSV);

            entity.HasOne(e => e.DotHocBong)
                .WithMany(e => e.HoSoXetHocBongs)
                .HasForeignKey(e => e.MaDot);

            entity.HasOne(e => e.CanBoDuyet)
                .WithMany(e => e.HoSoXetHocBongs)
                .HasForeignKey(e => e.MaCB_Duyet);
        });

        modelBuilder.Entity<KhieuNai>(entity =>
        {
            entity.ToTable("KHIEUNAI");
            entity.HasKey(e => e.MaKhieuNai);
            entity.Property(e => e.MaKhieuNai).ValueGeneratedOnAdd();
            entity.Property(e => e.NoiDung)
                .IsRequired()
                .HasColumnType("nvarchar(max)");
            entity.Property(e => e.MinhChung)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.NgayGui)
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("ChoXuLy");
            entity.Property(e => e.NoiDungPhanHoi)
                .HasColumnType("nvarchar(max)");
            entity.Property(e => e.NgayPhanHoi);

            entity.HasOne(e => e.HoSoXetHocBong)
                .WithMany(e => e.KhieuNais)
                .HasForeignKey(e => e.MaHoSo);

            entity.HasOne(e => e.CanBoDuyet)
                .WithMany(e => e.KhieuNais)
                .HasForeignKey(e => e.MaCB_Duyet);
        });

        modelBuilder.Entity<DSHocBong>(entity =>
        {
            entity.ToTable("DSHOCBONG");
            entity.HasKey(e => e.MaDS);
            entity.Property(e => e.MaDS).ValueGeneratedOnAdd();
            entity.Property(e => e.MaSV)
                .IsRequired()
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.XepLoai)
                .HasMaxLength(50);
            entity.Property(e => e.SoTien)
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.NgayPheDuyet)
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.DotHocBong)
                .WithMany(e => e.DSHocBongs)
                .HasForeignKey(e => e.MaDot);

            entity.HasOne(e => e.SinhVien)
                .WithMany(e => e.DSHocBongs)
                .HasForeignKey(e => e.MaSV);

            entity.HasOne(e => e.CanBoPheDuyet)
                .WithMany(e => e.DSHocBongs)
                .HasForeignKey(e => e.MaCB_PheDuyet);
        });

        modelBuilder.Entity<ChiTra>(entity =>
        {
            entity.ToTable("CHITRA");
            entity.HasKey(e => e.MaChiTra);
            entity.Property(e => e.MaChiTra).ValueGeneratedOnAdd();
            entity.Property(e => e.SoTien)
                .HasColumnType("decimal(18,2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("ChuaGiaiNgan");

            entity.HasOne(e => e.HoSoXetHocBong)
                .WithMany(e => e.ChiTras)
                .HasForeignKey(e => e.MaHoSo);

            entity.HasOne(e => e.CanBoGiaiNgan)
                .WithMany(e => e.ChiTras)
                .HasForeignKey(e => e.MaCB_GiaiNgan);
        });

        base.OnModelCreating(modelBuilder);
    }
}
