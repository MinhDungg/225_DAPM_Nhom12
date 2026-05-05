using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaV3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NgayPhanHoi",
                table: "KHIEUNAI",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoiDungPhanHoi",
                table: "KHIEUNAI",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<float>(
                name: "GPA",
                table: "KETQUAHOCTAP",
                type: "real",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<bool>(
                name: "CoDiemF",
                table: "KETQUAHOCTAP",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<float>(
                name: "DiemHocTap",
                table: "KETQUAHOCTAP",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AlterColumn<float>(
                name: "DiemHocTap",
                table: "HOSOXETHOCBONG",
                type: "real",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<float>(
                name: "GPA",
                table: "HOSOXETHOCBONG",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<string>(
                name: "GhiChu",
                table: "HOSOXETHOCBONG",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaKhoa",
                table: "CANBO",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CANBO_MaKhoa",
                table: "CANBO",
                column: "MaKhoa");

            migrationBuilder.AddForeignKey(
                name: "FK_CANBO_KHOA_MaKhoa",
                table: "CANBO",
                column: "MaKhoa",
                principalTable: "KHOA",
                principalColumn: "MaKhoa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CANBO_KHOA_MaKhoa",
                table: "CANBO");

            migrationBuilder.DropIndex(
                name: "IX_CANBO_MaKhoa",
                table: "CANBO");

            migrationBuilder.DropColumn(
                name: "NgayPhanHoi",
                table: "KHIEUNAI");

            migrationBuilder.DropColumn(
                name: "NoiDungPhanHoi",
                table: "KHIEUNAI");

            migrationBuilder.DropColumn(
                name: "CoDiemF",
                table: "KETQUAHOCTAP");

            migrationBuilder.DropColumn(
                name: "DiemHocTap",
                table: "KETQUAHOCTAP");

            migrationBuilder.DropColumn(
                name: "GPA",
                table: "HOSOXETHOCBONG");

            migrationBuilder.DropColumn(
                name: "GhiChu",
                table: "HOSOXETHOCBONG");

            migrationBuilder.DropColumn(
                name: "MaKhoa",
                table: "CANBO");

            migrationBuilder.AlterColumn<double>(
                name: "GPA",
                table: "KETQUAHOCTAP",
                type: "float",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AlterColumn<double>(
                name: "DiemHocTap",
                table: "HOSOXETHOCBONG",
                type: "float",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "real");
        }
    }
}
