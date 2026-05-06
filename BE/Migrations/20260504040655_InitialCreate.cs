using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DOTHOCBONG",
                columns: table => new
                {
                    MaDot = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoaiDot = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    HocKy = table.Column<int>(type: "int", nullable: false),
                    NamHoc = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    TrangThai = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true, defaultValue: "KhoiTao"),
                    LyDoTraVe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayCongBo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DOTHOCBONG", x => x.MaDot);
                });

            migrationBuilder.CreateTable(
                name: "KHOA",
                columns: table => new
                {
                    MaKhoa = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenKhoa = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KHOA", x => x.MaKhoa);
                });

            migrationBuilder.CreateTable(
                name: "PHONGBAN",
                columns: table => new
                {
                    MaPhong = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenPhong = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PHONGBAN", x => x.MaPhong);
                });

            migrationBuilder.CreateTable(
                name: "TAIKHOAN",
                columns: table => new
                {
                    MaTK = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenDangNhap = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    MatKhau = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    VaiTro = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TAIKHOAN", x => x.MaTK);
                });

            migrationBuilder.CreateTable(
                name: "LOP",
                columns: table => new
                {
                    MaLop = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenLop = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LOP", x => x.MaLop);
                    table.ForeignKey(
                        name: "FK_LOP_KHOA_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "KHOA",
                        principalColumn: "MaKhoa",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PHANBOKINHPHI",
                columns: table => new
                {
                    MaPhanBo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaDot = table.Column<int>(type: "int", nullable: false),
                    MaKhoa = table.Column<int>(type: "int", nullable: false),
                    KinhPhi = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MucHBLoaiKha = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PHANBOKINHPHI", x => x.MaPhanBo);
                    table.ForeignKey(
                        name: "FK_PHANBOKINHPHI_DOTHOCBONG_MaDot",
                        column: x => x.MaDot,
                        principalTable: "DOTHOCBONG",
                        principalColumn: "MaDot",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PHANBOKINHPHI_KHOA_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "KHOA",
                        principalColumn: "MaKhoa",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CANBO",
                columns: table => new
                {
                    MaCB = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HoTen = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    ChucVu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaPhong = table.Column<int>(type: "int", nullable: true),
                    MaKhoa = table.Column<int>(type: "int", nullable: true),
                    MaTK = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CANBO", x => x.MaCB);
                    table.ForeignKey(
                        name: "FK_CANBO_KHOA_MaKhoa",
                        column: x => x.MaKhoa,
                        principalTable: "KHOA",
                        principalColumn: "MaKhoa");
                    table.ForeignKey(
                        name: "FK_CANBO_PHONGBAN_MaPhong",
                        column: x => x.MaPhong,
                        principalTable: "PHONGBAN",
                        principalColumn: "MaPhong");
                    table.ForeignKey(
                        name: "FK_CANBO_TAIKHOAN_MaTK",
                        column: x => x.MaTK,
                        principalTable: "TAIKHOAN",
                        principalColumn: "MaTK");
                });

            migrationBuilder.CreateTable(
                name: "SINHVIEN",
                columns: table => new
                {
                    MaSV = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NgaySinh = table.Column<DateTime>(type: "date", nullable: true),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    SDT = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: true),
                    MaLop = table.Column<int>(type: "int", nullable: false),
                    MaTK = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SINHVIEN", x => x.MaSV);
                    table.ForeignKey(
                        name: "FK_SINHVIEN_LOP_MaLop",
                        column: x => x.MaLop,
                        principalTable: "LOP",
                        principalColumn: "MaLop",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SINHVIEN_TAIKHOAN_MaTK",
                        column: x => x.MaTK,
                        principalTable: "TAIKHOAN",
                        principalColumn: "MaTK");
                });

            migrationBuilder.CreateTable(
                name: "DIEMRENLUYEN",
                columns: table => new
                {
                    MaDRL = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaSV = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    HocKy = table.Column<int>(type: "int", nullable: false),
                    NamHoc = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    DiemSo = table.Column<int>(type: "int", nullable: false),
                    MaCB_Nhap = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DIEMRENLUYEN", x => x.MaDRL);
                    table.ForeignKey(
                        name: "FK_DIEMRENLUYEN_CANBO_MaCB_Nhap",
                        column: x => x.MaCB_Nhap,
                        principalTable: "CANBO",
                        principalColumn: "MaCB");
                    table.ForeignKey(
                        name: "FK_DIEMRENLUYEN_SINHVIEN_MaSV",
                        column: x => x.MaSV,
                        principalTable: "SINHVIEN",
                        principalColumn: "MaSV",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DSHOCBONG",
                columns: table => new
                {
                    MaDS = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaDot = table.Column<int>(type: "int", nullable: false),
                    MaSV = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    XepLoai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayPheDuyet = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    MaCB_PheDuyet = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DSHOCBONG", x => x.MaDS);
                    table.ForeignKey(
                        name: "FK_DSHOCBONG_CANBO_MaCB_PheDuyet",
                        column: x => x.MaCB_PheDuyet,
                        principalTable: "CANBO",
                        principalColumn: "MaCB",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DSHOCBONG_DOTHOCBONG_MaDot",
                        column: x => x.MaDot,
                        principalTable: "DOTHOCBONG",
                        principalColumn: "MaDot",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DSHOCBONG_SINHVIEN_MaSV",
                        column: x => x.MaSV,
                        principalTable: "SINHVIEN",
                        principalColumn: "MaSV",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HOSOXETHOCBONG",
                columns: table => new
                {
                    MaHoSo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaSV = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    MaDot = table.Column<int>(type: "int", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    GPA = table.Column<float>(type: "real", nullable: false),
                    DiemHocTap = table.Column<float>(type: "real", nullable: false),
                    DiemRenLuyen = table.Column<int>(type: "int", nullable: false),
                    XepLoaiHB = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TrangThai = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, defaultValue: "ChoXet"),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaCB_Duyet = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HOSOXETHOCBONG", x => x.MaHoSo);
                    table.ForeignKey(
                        name: "FK_HOSOXETHOCBONG_CANBO_MaCB_Duyet",
                        column: x => x.MaCB_Duyet,
                        principalTable: "CANBO",
                        principalColumn: "MaCB");
                    table.ForeignKey(
                        name: "FK_HOSOXETHOCBONG_DOTHOCBONG_MaDot",
                        column: x => x.MaDot,
                        principalTable: "DOTHOCBONG",
                        principalColumn: "MaDot",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HOSOXETHOCBONG_SINHVIEN_MaSV",
                        column: x => x.MaSV,
                        principalTable: "SINHVIEN",
                        principalColumn: "MaSV",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KETQUAHOCTAP",
                columns: table => new
                {
                    MaDiem = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaSV = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    HocKy = table.Column<int>(type: "int", nullable: false),
                    NamHoc = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    GPA = table.Column<float>(type: "real", nullable: false),
                    DiemHocTap = table.Column<float>(type: "real", nullable: false),
                    SoTC = table.Column<int>(type: "int", nullable: false),
                    CoDiemF = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    MaCB_Nhap = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KETQUAHOCTAP", x => x.MaDiem);
                    table.ForeignKey(
                        name: "FK_KETQUAHOCTAP_CANBO_MaCB_Nhap",
                        column: x => x.MaCB_Nhap,
                        principalTable: "CANBO",
                        principalColumn: "MaCB");
                    table.ForeignKey(
                        name: "FK_KETQUAHOCTAP_SINHVIEN_MaSV",
                        column: x => x.MaSV,
                        principalTable: "SINHVIEN",
                        principalColumn: "MaSV",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CHITRA",
                columns: table => new
                {
                    MaChiTra = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHoSo = table.Column<int>(type: "int", nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayXacNhan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrangThai = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, defaultValue: "ChuaGiaiNgan"),
                    MaCB_GiaiNgan = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CHITRA", x => x.MaChiTra);
                    table.ForeignKey(
                        name: "FK_CHITRA_CANBO_MaCB_GiaiNgan",
                        column: x => x.MaCB_GiaiNgan,
                        principalTable: "CANBO",
                        principalColumn: "MaCB");
                    table.ForeignKey(
                        name: "FK_CHITRA_HOSOXETHOCBONG_MaHoSo",
                        column: x => x.MaHoSo,
                        principalTable: "HOSOXETHOCBONG",
                        principalColumn: "MaHoSo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KHIEUNAI",
                columns: table => new
                {
                    MaKhieuNai = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHoSo = table.Column<int>(type: "int", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MinhChung = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    NgayGui = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    TrangThai = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, defaultValue: "ChoXuLy"),
                    MaCB_Duyet = table.Column<int>(type: "int", nullable: true),
                    NoiDungPhanHoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayPhanHoi = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KHIEUNAI", x => x.MaKhieuNai);
                    table.ForeignKey(
                        name: "FK_KHIEUNAI_CANBO_MaCB_Duyet",
                        column: x => x.MaCB_Duyet,
                        principalTable: "CANBO",
                        principalColumn: "MaCB");
                    table.ForeignKey(
                        name: "FK_KHIEUNAI_HOSOXETHOCBONG_MaHoSo",
                        column: x => x.MaHoSo,
                        principalTable: "HOSOXETHOCBONG",
                        principalColumn: "MaHoSo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CANBO_MaKhoa",
                table: "CANBO",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_CANBO_MaPhong",
                table: "CANBO",
                column: "MaPhong");

            migrationBuilder.CreateIndex(
                name: "IX_CANBO_MaTK",
                table: "CANBO",
                column: "MaTK",
                unique: true,
                filter: "[MaTK] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CHITRA_MaCB_GiaiNgan",
                table: "CHITRA",
                column: "MaCB_GiaiNgan");

            migrationBuilder.CreateIndex(
                name: "IX_CHITRA_MaHoSo",
                table: "CHITRA",
                column: "MaHoSo");

            migrationBuilder.CreateIndex(
                name: "IX_DIEMRENLUYEN_MaCB_Nhap",
                table: "DIEMRENLUYEN",
                column: "MaCB_Nhap");

            migrationBuilder.CreateIndex(
                name: "IX_DIEMRENLUYEN_MaSV",
                table: "DIEMRENLUYEN",
                column: "MaSV");

            migrationBuilder.CreateIndex(
                name: "IX_DSHOCBONG_MaCB_PheDuyet",
                table: "DSHOCBONG",
                column: "MaCB_PheDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_DSHOCBONG_MaDot",
                table: "DSHOCBONG",
                column: "MaDot");

            migrationBuilder.CreateIndex(
                name: "IX_DSHOCBONG_MaSV",
                table: "DSHOCBONG",
                column: "MaSV");

            migrationBuilder.CreateIndex(
                name: "IX_HOSOXETHOCBONG_MaCB_Duyet",
                table: "HOSOXETHOCBONG",
                column: "MaCB_Duyet");

            migrationBuilder.CreateIndex(
                name: "IX_HOSOXETHOCBONG_MaDot",
                table: "HOSOXETHOCBONG",
                column: "MaDot");

            migrationBuilder.CreateIndex(
                name: "IX_HOSOXETHOCBONG_MaSV",
                table: "HOSOXETHOCBONG",
                column: "MaSV");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUAHOCTAP_MaCB_Nhap",
                table: "KETQUAHOCTAP",
                column: "MaCB_Nhap");

            migrationBuilder.CreateIndex(
                name: "IX_KETQUAHOCTAP_MaSV",
                table: "KETQUAHOCTAP",
                column: "MaSV");

            migrationBuilder.CreateIndex(
                name: "IX_KHIEUNAI_MaCB_Duyet",
                table: "KHIEUNAI",
                column: "MaCB_Duyet");

            migrationBuilder.CreateIndex(
                name: "IX_KHIEUNAI_MaHoSo",
                table: "KHIEUNAI",
                column: "MaHoSo");

            migrationBuilder.CreateIndex(
                name: "IX_LOP_MaKhoa",
                table: "LOP",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_PHANBOKINHPHI_MaDot_MaKhoa",
                table: "PHANBOKINHPHI",
                columns: new[] { "MaDot", "MaKhoa" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PHANBOKINHPHI_MaKhoa",
                table: "PHANBOKINHPHI",
                column: "MaKhoa");

            migrationBuilder.CreateIndex(
                name: "IX_SINHVIEN_MaLop",
                table: "SINHVIEN",
                column: "MaLop");

            migrationBuilder.CreateIndex(
                name: "IX_SINHVIEN_MaTK",
                table: "SINHVIEN",
                column: "MaTK",
                unique: true,
                filter: "[MaTK] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TAIKHOAN_TenDangNhap",
                table: "TAIKHOAN",
                column: "TenDangNhap",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CHITRA");

            migrationBuilder.DropTable(
                name: "DIEMRENLUYEN");

            migrationBuilder.DropTable(
                name: "DSHOCBONG");

            migrationBuilder.DropTable(
                name: "KETQUAHOCTAP");

            migrationBuilder.DropTable(
                name: "KHIEUNAI");

            migrationBuilder.DropTable(
                name: "PHANBOKINHPHI");

            migrationBuilder.DropTable(
                name: "HOSOXETHOCBONG");

            migrationBuilder.DropTable(
                name: "CANBO");

            migrationBuilder.DropTable(
                name: "DOTHOCBONG");

            migrationBuilder.DropTable(
                name: "SINHVIEN");

            migrationBuilder.DropTable(
                name: "PHONGBAN");

            migrationBuilder.DropTable(
                name: "LOP");

            migrationBuilder.DropTable(
                name: "TAIKHOAN");

            migrationBuilder.DropTable(
                name: "KHOA");
        }
    }
}
