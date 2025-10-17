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
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            return Ok(new { user.Id, user.Username, user.Email, user.Role, user.WalletAmount, user.MfaEnabled });
        }

        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
                return BadRequest("User already exists");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User created successfully", userId = user.Id });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.WalletAmount, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest("Current password is incorrect");

            if (!IsStrongPassword(request.NewPassword))
                return BadRequest("Password must be at least 8 characters with uppercase, lowercase, number and special character");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }

        [HttpPost("setup-mfa")]
        public async Task<IActionResult> SetupMfa()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            if (user.MfaEnabled)
                return BadRequest("MFA is already enabled");

            var secret = GenerateSecret();
            user.MfaSecret = secret;
            await _context.SaveChangesAsync();

            var qrCodeUrl = $"otpauth://totp/SaralPay:{user.Username}?secret={secret}&issuer=SaralPay";
            return Ok(new { secret, qrCodeUrl });
        }

        [HttpPost("enable-mfa")]
        public async Task<IActionResult> EnableMfa([FromBody] VerifyMfaRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || string.IsNullOrEmpty(user.MfaSecret))
                return NotFound();

            if (!VerifyTotp(user.MfaSecret, request.Code))
                return BadRequest("Invalid verification code");

            user.MfaEnabled = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "MFA enabled successfully" });
        }

        [HttpPost("disable-mfa")]
        public async Task<IActionResult> DisableMfa([FromBody] VerifyMfaRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null || !user.MfaEnabled)
                return BadRequest("MFA is not enabled");

            if (!VerifyTotp(user.MfaSecret!, request.Code))
                return BadRequest("Invalid verification code");

            user.MfaEnabled = false;
            user.MfaSecret = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "MFA disabled successfully" });
        }

        private static bool IsStrongPassword(string password)
        {
            if (password.Length < 8) return false;
            if (!password.Any(char.IsUpper)) return false;
            if (!password.Any(char.IsLower)) return false;
            if (!password.Any(char.IsDigit)) return false;
            if (!password.Any(ch => "!@#$%^&*()_+-=[]{}|;:,.<>?".Contains(ch))) return false;
            return true;
        }

        private static string GenerateSecret()
        {
            var bytes = new byte[20];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase32String(bytes).Replace("=", "");
        }

        private static bool VerifyTotp(string secret, string code)
        {
            var secretBytes = Convert.FromBase32String(secret);
            var unixTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var timeStep = unixTime / 30;
            
            for (int i = -1; i <= 1; i++)
            {
                var testCode = GenerateTotp(secretBytes, timeStep + i);
                if (testCode == code) return true;
            }
            return false;
        }

        private static string GenerateTotp(byte[] secret, long timeStep)
        {
            var timeBytes = BitConverter.GetBytes(timeStep);
            if (BitConverter.IsLittleEndian) Array.Reverse(timeBytes);
            
            using var hmac = new System.Security.Cryptography.HMACSHA1(secret);
            var hash = hmac.ComputeHash(timeBytes);
            var offset = hash[hash.Length - 1] & 0x0F;
            var code = ((hash[offset] & 0x7F) << 24) |
                      ((hash[offset + 1] & 0xFF) << 16) |
                      ((hash[offset + 2] & 0xFF) << 8) |
                      (hash[offset + 3] & 0xFF);
            return (code % 1000000).ToString("D6");
        }
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class VerifyMfaRequest
    {
        public string Code { get; set; } = string.Empty;
    }

    public static class Convert
    {
        private const string Base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static string ToBase32String(byte[] bytes)
        {
            if (bytes.Length == 0) return string.Empty;
            
            var result = new System.Text.StringBuilder();
            int buffer = bytes[0];
            int next = 1;
            int bitsLeft = 8;
            
            while (bitsLeft > 0 || next < bytes.Length)
            {
                if (bitsLeft < 5)
                {
                    if (next < bytes.Length)
                    {
                        buffer <<= 8;
                        buffer |= bytes[next++] & 0xFF;
                        bitsLeft += 8;
                    }
                    else
                    {
                        int pad = 5 - bitsLeft;
                        buffer <<= pad;
                        bitsLeft += pad;
                    }
                }
                
                int index = 0x1F & (buffer >> (bitsLeft - 5));
                bitsLeft -= 5;
                result.Append(Base32Chars[index]);
            }
            
            return result.ToString();
        }

        public static byte[] FromBase32String(string base32)
        {
            if (string.IsNullOrEmpty(base32)) return new byte[0];
            
            var result = new List<byte>();
            int buffer = 0;
            int bitsLeft = 0;
            
            foreach (char c in base32.ToUpper())
            {
                int value = Base32Chars.IndexOf(c);
                if (value < 0) continue;
                
                buffer = (buffer << 5) | value;
                bitsLeft += 5;
                
                if (bitsLeft >= 8)
                {
                    result.Add((byte)(buffer >> (bitsLeft - 8)));
                    bitsLeft -= 8;
                }
            }
            
            return result.ToArray();
        }
    }
}