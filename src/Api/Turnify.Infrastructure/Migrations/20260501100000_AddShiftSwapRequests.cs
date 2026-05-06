using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations
{
    public partial class AddShiftSwapRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShiftSwapRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    RequestingEmployeeId = table.Column<int>(type: "int",          nullable: false),
                    RequestedEmployeeId  = table.Column<int>(type: "int",          nullable: false),
                    ShiftAId             = table.Column<int>(type: "int",          nullable: false),
                    ShiftBId             = table.Column<int>(type: "int",          nullable: false),
                    Status               = table.Column<string>(type: "varchar(30)", nullable: false).Annotation("MySql:CharSet", "utf8mb4"),
                    Note                 = table.Column<string>(type: "longtext",  nullable: true).Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt            = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ResolvedAt           = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftSwapRequests", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftSwapRequests_RequestingEmployeeId",
                table: "ShiftSwapRequests",
                column: "RequestingEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftSwapRequests_RequestedEmployeeId",
                table: "ShiftSwapRequests",
                column: "RequestedEmployeeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ShiftSwapRequests");
        }
    }
}
