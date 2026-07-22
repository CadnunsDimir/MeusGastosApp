using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CadnunsDev.MeusGastos.Backend.Migrations
{
    /// <inheritdoc />
    public partial class CreateTableShareDashboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShareDashboardS",
                columns: table => new
                {
                    ShareId = table.Column<Guid>(type: "uuid", nullable: false),
                    DashboardOwnerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SharedWithUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CanEdit = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShareDashboardS", x => x.ShareId);
                    table.ForeignKey(
                        name: "FK_ShareDashboardS_Users_DashboardOwnerUserId",
                        column: x => x.DashboardOwnerUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShareDashboardS_Users_SharedWithUserId",
                        column: x => x.SharedWithUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ShareDashboardS_DashboardOwnerUserId_SharedWithUserId",
                table: "ShareDashboardS",
                columns: new[] { "DashboardOwnerUserId", "SharedWithUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShareDashboardS_SharedWithUserId",
                table: "ShareDashboardS",
                column: "SharedWithUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShareDashboardS");
        }
    }
}
