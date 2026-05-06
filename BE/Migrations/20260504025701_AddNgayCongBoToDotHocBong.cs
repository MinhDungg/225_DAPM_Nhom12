using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BE.Migrations
{
    /// <inheritdoc />
    public partial class AddNgayCongBoToDotHocBong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LyDoTraVe",
                table: "DOTHOCBONG",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayCongBo",
                table: "DOTHOCBONG",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LyDoTraVe",
                table: "DOTHOCBONG");

            migrationBuilder.DropColumn(
                name: "NgayCongBo",
                table: "DOTHOCBONG");
        }
    }
}
