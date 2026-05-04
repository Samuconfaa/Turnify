using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnify.Infrastructure.Migrations;

public partial class AddPasswordResetToUser : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "PasswordResetToken",
            table: "Users",
            type: "longtext",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "PasswordResetTokenExpiryTime",
            table: "Users",
            type: "datetime(6)",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "PasswordResetToken",           table: "Users");
        migrationBuilder.DropColumn(name: "PasswordResetTokenExpiryTime", table: "Users");
    }
}
