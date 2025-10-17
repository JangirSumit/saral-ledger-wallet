using System.ComponentModel.DataAnnotations;

namespace SaralLedgerAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "User"; // "Admin" or "User"
        
        public decimal WalletAmount { get; set; } = 0;
        
        public bool MfaEnabled { get; set; } = false;
        
        public string? MfaSecret { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<Ledger> Ledgers { get; set; } = new List<Ledger>();
    }
}