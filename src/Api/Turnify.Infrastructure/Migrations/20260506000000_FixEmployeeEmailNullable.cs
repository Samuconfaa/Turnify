using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations
{
    public partial class FixEmployeeEmailNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rendi Email nullable
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Employees",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)");

            // Rimuovi il vecchio indice unico senza filtro
            migrationBuilder.DropIndex(
                name: "IX_Employees_CompanyId_Email",
                table: "Employees");

            // Svuota le email che sono stringa vuota (rese null)
            migrationBuilder.Sql(
                "UPDATE `Employees` SET `Email` = NULL WHERE `Email` = '';");

            // Ricrea l'indice unico filtrato (esclude NULL e stringa vuota)
            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX `IX_Employees_CompanyId_Email` " +
                "ON `Employees` (`CompanyId`, `Email`) " +
                "WHERE (`Email` IS NOT NULL AND `Email` != '');");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_CompanyId_Email",
                table: "Employees");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Employees",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldNullable: true,
                oldType: "varchar(255)");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CompanyId_Email",
                table: "Employees",
                columns: new[] { "CompanyId", "Email" },
                unique: true);
        }
    }
}
