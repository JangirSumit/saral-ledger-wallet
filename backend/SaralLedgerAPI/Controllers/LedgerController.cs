using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO.Compression;
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

        [HttpPost("create")]
        public async Task<IActionResult> CreateLedger([FromForm] LedgerCreateRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            byte[]? compressedFileData = null;
            string? fileName = null;
            string? contentType = null;

            if (request.File != null)
            {
                fileName = request.File.FileName;
                contentType = request.File.ContentType;
                
                using var memoryStream = new MemoryStream();
                await request.File.CopyToAsync(memoryStream);
                compressedFileData = CompressData(memoryStream.ToArray());
            }

            var ledger = new Ledger
            {
                UserId = userId,
                Amount = request.Amount,
                Description = request.Description,
                Status = "Pending",
                FileName = fileName,
                FileData = compressedFileData,
                ContentType = contentType
            };

            _context.Ledgers.Add(ledger);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Ledger created successfully", ledgerId = ledger.Id });
        }

        [HttpGet("my-ledgers")]
        public async Task<IActionResult> GetMyLedgers()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledgers = await _context.Ledgers
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    l.Id,
                    l.UserId,
                    l.Amount,
                    l.Description,
                    l.Status,
                    l.CreatedAt,
                    l.ApprovedAt,
                    l.FileName,
                    l.ContentType,
                    l.RejectionReason
                })
                .ToListAsync();

            return Ok(ledgers);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllLedgers()
        {
            var ledgers = await _context.Ledgers
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    l.Id,
                    l.UserId,
                    l.Amount,
                    l.Description,
                    l.Status,
                    l.CreatedAt,
                    l.ApprovedAt,
                    l.FileName,
                    l.ContentType,
                    l.RejectionReason,
                    User = new { l.User.Id, l.User.Username, l.User.Email, l.User.Role, l.User.WalletAmount }
                })
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
                .Select(l => new {
                    l.Id,
                    l.UserId,
                    l.Amount,
                    l.Description,
                    l.Status,
                    l.CreatedAt,
                    l.ApprovedAt,
                    l.FileName,
                    l.ContentType,
                    l.RejectionReason,
                    User = new { l.User.Id, l.User.Username, l.User.Email, l.User.Role, l.User.WalletAmount }
                })
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
        [Consumes("application/json")]
        public async Task<IActionResult> RejectLedger(int id, [FromBody] RejectLedgerRequest request)
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
            ledger.RejectionReason = request.Reason;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Ledger rejected successfully" });
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
            
            var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.Id == id);
            
            if (ledger == null)
                return NotFound();
                
            // Users can only download their own files, admins can download any
            if (userRole != "Admin" && ledger.UserId != userId)
                return Forbid();
                
            if (ledger.FileData == null)
                return NotFound("No file attached");
                
            var decompressedData = DecompressData(ledger.FileData);
            
            return File(decompressedData, ledger.ContentType ?? "application/octet-stream", ledger.FileName);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLedger(int id, [FromForm] LedgerCreateRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (ledger == null)
                return NotFound();

            if (ledger.Status != "Pending")
                return BadRequest("Cannot update non-pending ledger");

            ledger.Amount = request.Amount;
            ledger.Description = request.Description;

            if (request.File != null)
            {
                ledger.FileName = request.File.FileName;
                ledger.ContentType = request.File.ContentType;
                
                using var memoryStream = new MemoryStream();
                await request.File.CopyToAsync(memoryStream);
                ledger.FileData = CompressData(memoryStream.ToArray());
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Ledger updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLedger(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var ledger = await _context.Ledgers.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (ledger == null)
                return NotFound();

            if (ledger.Status != "Pending")
                return BadRequest("Cannot delete non-pending ledger");

            _context.Ledgers.Remove(ledger);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Ledger deleted successfully" });
        }

        private static byte[] CompressData(byte[] data)
        {
            using var output = new MemoryStream();
            using (var gzip = new GZipStream(output, CompressionMode.Compress))
            {
                gzip.Write(data, 0, data.Length);
            }
            return output.ToArray();
        }

        private static byte[] DecompressData(byte[] compressedData)
        {
            using var input = new MemoryStream(compressedData);
            using var output = new MemoryStream();
            using (var gzip = new GZipStream(input, CompressionMode.Decompress))
            {
                gzip.CopyTo(output);
            }
            return output.ToArray();
        }
    }

    public class LedgerCreateRequest
    {
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public IFormFile? File { get; set; }
    }

    public class RejectLedgerRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}