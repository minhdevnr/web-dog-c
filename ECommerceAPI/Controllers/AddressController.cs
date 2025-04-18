using ECommerceAPI.Data;
using ECommerceAPI.Entities;
using ECommerceAPI.Models;
using ECommerceAPI.Models.Requests;
using ECommerceAPI.Models.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerceAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AddressController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AddressResponse>>> GetAddresses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.CreatedAt)
                .Select(a => new AddressResponse
                {
                    Id = a.Id,
                    ReceiverName = a.ReceiverName,
                    Phone = a.Phone,
                    AddressLine = a.AddressLine,
                    Ward = a.Ward,
                    District = a.District,
                    City = a.City,
                    IsDefault = a.IsDefault
                })
                .ToListAsync();

            return addresses;
        }

        [HttpPost]
        public async Task<ActionResult<AddressResponse>> CreateAddress(AddressRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (request.IsDefault)
                {
                    var defaultAddress = await _context.Addresses
                        .Where(a => a.UserId == userId && a.IsDefault)
                        .FirstOrDefaultAsync();

                    if (defaultAddress != null)
                    {
                        defaultAddress.IsDefault = false;
                        _context.Addresses.Update(defaultAddress);
                    }
                }

                var address = new Address
                {
                    UserId = userId,
                    ReceiverName = request.ReceiverName,
                    Phone = request.Phone,
                    AddressLine = request.AddressLine,
                    Ward = request.Ward,
                    District = request.District,
                    City = request.City,
                    IsDefault = request.IsDefault
                };

                _context.Addresses.Add(address);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new AddressResponse
                {
                    Id = address.Id,
                    ReceiverName = address.ReceiverName,
                    Phone = address.Phone,
                    AddressLine = address.AddressLine,
                    Ward = address.Ward,
                    District = address.District,
                    City = address.City,
                    IsDefault = address.IsDefault
                };
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, AddressRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
                return NotFound();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (request.IsDefault && !address.IsDefault)
                {
                    var defaultAddress = await _context.Addresses
                        .Where(a => a.UserId == userId && a.IsDefault)
                        .FirstOrDefaultAsync();

                    if (defaultAddress != null)
                    {
                        defaultAddress.IsDefault = false;
                        _context.Addresses.Update(defaultAddress);
                    }
                }

                address.ReceiverName = request.ReceiverName;
                address.Phone = request.Phone;
                address.AddressLine = request.AddressLine;
                address.Ward = request.Ward;
                address.District = request.District;
                address.City = request.City;
                address.IsDefault = request.IsDefault;
                address.UpdatedAt = DateTime.UtcNow;

                _context.Addresses.Update(address);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var address = await _context.Addresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
                return NotFound();

            if (address.IsDefault)
                return BadRequest(new { message = "Không thể xóa địa chỉ mặc định" });

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}