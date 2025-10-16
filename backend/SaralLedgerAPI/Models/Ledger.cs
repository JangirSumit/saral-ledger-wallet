using System.ComponentModel.DataAnnotations;

namespace SaralLedgerAPI.Models
{
    public class Ledger
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Status { get; set; } = "Pending"; // "Pending", "Approved", "Rejected"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ApprovedAt { get; set; }
        
        public int? ApprovedBy { get; set; }
        
        public string? FileName { get; set; }
        
        public byte[]? FileData { get; set; }
        
        public string? ContentType { get; set; }
        
        public string? RejectionReason { get; set; }
        
        public User User { get; set; } = null!;
    }
}