using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SaralLedgerAPI.Data;
using SaralLedgerAPI.Models;

namespace SaralLedgerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LedgerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LedgerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadLedger([FromBody] LedgerUploadRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var ledger = new Ledger
            {
                UserId = userId,
                Amount = request.Amount,
                Description = request.Description,
                Status = "Pending"
            };

            _context.Ledgers.Add(ledger);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ledger uploaded successfully", ledgerId = ledger.Id });
        }

        [HttpGet("my-ledgers")]
        public async Task<IActionResult> GetMyLedgers()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledgers = await _context.Ledgers
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return Ok(ledgers);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingLedgers()
        {
            var ledgers = await _context.Ledgers
                .Include(l => l.User)
                .Where(l => l.Status == "Pending")
                .OrderBy(l => l.CreatedAt)
                .ToListAsync();

            return Ok(ledgers);
        }

        [HttpPost("approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveLedger(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledger = await _context.Ledgers.Include(l => l.User).FirstOrDefaultAsync(l => l.Id == id);

            if (ledger == null)
                return NotFound();

            if (ledger.Status != "Pending")
                return BadRequest("Ledger is not pending");

            ledger.Status = "Approved";
            ledger.ApprovedAt = DateTime.UtcNow;
            ledger.ApprovedBy = adminId;

            // Update user wallet amount
            ledger.User.WalletAmount += ledger.Amount;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Ledger approved successfully" });
        }

        [HttpPost("reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectLedger(int id)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.Id == id);

            if (ledger == null)
                return NotFound();

            if (ledger.Status != "Pending")
                return BadRequest("Ledger is not pending");

            ledger.Status = "Rejected";
            ledger.ApprovedAt = DateTime.UtcNow;
            ledger.ApprovedBy = adminId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Ledger rejected successfully" });
        }
    }

    public class LedgerUploadRequest
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}