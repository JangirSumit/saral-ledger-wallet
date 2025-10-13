using SaralLedgerAPI.Models;

namespace SaralLedgerAPI.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Users.Any())
                return; // DB has been seeded

            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                WalletAmount = 0,
                CreatedAt = DateTime.UtcNow
            };

            var testUser = new User
            {
                Username = "user1",
                Email = "user1@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Role = "User",
                WalletAmount = 0,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, testUser);
            context.SaveChanges();
        }
    }
}