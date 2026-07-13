using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CadnunsDev.MeusGastos.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMovementType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RelatedMovementId",
                table: "BankAccountMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "BankAccountMovements",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("UPDATE \"BankAccountMovements\" SET \"Type\" = 1 WHERE \"Value\" >= 0;");
            migrationBuilder.Sql("UPDATE \"BankAccountMovements\" SET \"Type\" = 2 WHERE \"Value\" < 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelatedMovementId",
                table: "BankAccountMovements");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "BankAccountMovements");
        }
    }
}
