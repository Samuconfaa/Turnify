using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations;

public partial class AddUsernameToUser : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Rende Email nullable
        migrationBuilder.AlterColumn<string>(
            name: "Email",
            table: "Users",
            type: "varchar(255)",
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(255)");

        // Aggiunge colonna Username (nullable)
        migrationBuilder.AddColumn<string>(
            name: "Username",
            table: "Users",
            type: "varchar(100)",
            maxLength: 100,
            nullable: true)
            .Annotation("MySql:CharSet", "utf8mb4");

        // Indice unico (CompanyId, Username) — MySQL permette più NULL, unicità solo su valori non-NULL
        migrationBuilder.CreateIndex(
            name: "IX_Users_CompanyId_Username",
            table: "Users",
            columns: new[] { "CompanyId", "Username" },
            unique: true,
            filter: "`Username` IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Users_CompanyId_Username",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "Username",
            table: "Users");

        migrationBuilder.AlterColumn<string>(
            name: "Email",
            table: "Users",
            type: "varchar(255)",
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(255)",
            oldNullable: true);
    }
}
