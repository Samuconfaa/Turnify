using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations
{
    public partial class AddPaidLeaveAndInvites : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaidLeaveDaysPerYear",
                table: "Employees",
                type: "int",
                nullable: false,
                defaultValue: 8);

            migrationBuilder.CreateTable(
                name: "Invites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Code            = table.Column<string>(type: "varchar(20)",  nullable: false).Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyId       = table.Column<int>(type: "int",             nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int",             nullable: false),
                    ExpiresAt       = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsUsed          = table.Column<bool>(type: "tinyint(1)",     nullable: false),
                    UsedByUserId    = table.Column<int>(type: "int",             nullable: true),
                    CreatedAt       = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invites", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Invites_Code",
                table: "Invites",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invites_CompanyId_IsUsed",
                table: "Invites",
                columns: new[] { "CompanyId", "IsUsed" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Invites");

            migrationBuilder.DropColumn(
                name: "PaidLeaveDaysPerYear",
                table: "Employees");
        }
    }
}
