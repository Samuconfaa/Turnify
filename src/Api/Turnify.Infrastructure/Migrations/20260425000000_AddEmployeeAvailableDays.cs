using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations
{
    public partial class AddEmployeeAvailableDays : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvailableDays",
                table: "Employees",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "1,2,3,4,5")
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableDays",
                table: "Employees");
        }
    }
}
