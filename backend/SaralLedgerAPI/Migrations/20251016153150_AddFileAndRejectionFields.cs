using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SaralLedgerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFileAndRejectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentType",
                table: "Ledgers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "FileData",
                table: "Ledgers",
                type: "BLOB",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "Ledgers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Ledgers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "Ledgers");

            migrationBuilder.DropColumn(
                name: "FileData",
                table: "Ledgers");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "Ledgers");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Ledgers");
        }
    }
}
