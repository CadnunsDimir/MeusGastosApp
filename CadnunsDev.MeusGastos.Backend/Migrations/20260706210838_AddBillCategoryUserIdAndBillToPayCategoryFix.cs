using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CadnunsDev.MeusGastos.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddBillCategoryUserIdAndBillToPayCategoryFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RepeatValueNextMoth",
                table: "BillsToPay",
                newName: "RepeatValueNextMonth");

            migrationBuilder.AddColumn<int>(
                name: "Month",
                table: "BillsToPay",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "BillsToPay",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BillCategories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_BillCategories_UserId",
                table: "BillCategories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BillCategories_Users_UserId",
                table: "BillCategories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillCategories_Users_UserId",
                table: "BillCategories");

            migrationBuilder.DropIndex(
                name: "IX_BillCategories_UserId",
                table: "BillCategories");

            migrationBuilder.DropColumn(
                name: "Month",
                table: "BillsToPay");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "BillsToPay");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BillCategories");

            migrationBuilder.RenameColumn(
                name: "RepeatValueNextMonth",
                table: "BillsToPay",
                newName: "RepeatValueNextMoth");
        }
    }
}
