using Microsoft.EntityFrameworkCore;
using SaralLedgerAPI.Models;

namespace SaralLedgerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Ledger> Ledgers { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
                
            modelBuilder.Entity<Ledger>()
                .HasOne(l => l.User)
                .WithMany(u => u.Ledgers)
                .HasForeignKey(l => l.UserId);
                
            modelBuilder.Entity<User>()
                .Property(u => u.WalletAmount)
                .HasPrecision(18, 2);
                
            modelBuilder.Entity<Ledger>()
                .Property(l => l.Amount)
                .HasPrecision(18, 2);
        }
    }
}