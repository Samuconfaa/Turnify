using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations
{
    public partial class CleanupDeadCode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInLatitude",
                table: "AttendanceLogs");

            migrationBuilder.DropColumn(
                name: "CheckInLongitude",
                table: "AttendanceLogs");

            migrationBuilder.DropTable(
                name: "Invites");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CheckInLatitude",
                table: "AttendanceLogs",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CheckInLongitude",
                table: "AttendanceLogs",
                type: "decimal(65,30)",
                nullable: true);
        }
    }
}
