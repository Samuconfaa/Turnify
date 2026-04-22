using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Turnify.Api.DTOs;
using Turnify.Core.Interfaces.Repositories;
using Turnify.Core.Models;

namespace Turnify.Api.Controllers;

public class CreateBusinessRequest
{
    public string Name { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
}

public class UpdateBusinessRequest
{
    public string Name { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

[ApiController]
[Route("api/businesses")]
[Authorize]
public class BusinessesController : ControllerBase
{
    private readonly IBusinessRepository _businessRepository;

    public BusinessesController(IBusinessRepository businessRepository)
    {
        _businessRepository = businessRepository;
    }

    private int GetCompanyId()
    {
        var claim = User.FindFirst("companyId");
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private bool IsAdmin()
    {
        return User.IsInRole(UserRole.Admin.ToString());
    }

    [HttpGet]
    public async Task<IActionResult> GetBusinesses(CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();
        var businesses = await _businessRepository.GetAllByCompanyIdAsync(companyId, ct);

        var dtos = businesses.Select(b => new BusinessDto
        {
            Id = b.Id,
            CompanyId = b.CompanyId,
            Name = b.Name,
            BusinessType = b.BusinessType,
            Address = b.Address,
            Phone = b.Phone,
            OpeningHours = b.OpeningHours,
            IsActive = b.IsActive
        }).ToList();

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBusiness([FromBody] CreateBusinessRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var companyId = GetCompanyId();

        var business = new Business
        {
            CompanyId = companyId,
            Name = request.Name,
            BusinessType = request.BusinessType,
            Address = request.Address,
            Phone = request.Phone,
            OpeningHours = request.OpeningHours,
            IsActive = true
        };

        var created = await _businessRepository.AddAsync(business, ct);

        return Created($"/api/businesses/{created.Id}", new BusinessDto
        {
            Id = created.Id,
            CompanyId = created.CompanyId,
            Name = created.Name,
            BusinessType = created.BusinessType,
            Address = created.Address,
            Phone = created.Phone,
            OpeningHours = created.OpeningHours,
            IsActive = created.IsActive
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(int id, [FromBody] UpdateBusinessRequest request, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var business = await _businessRepository.GetByIdAsync(id, ct);
        if (business == null) return NotFound();

        if (business.CompanyId != GetCompanyId()) return Forbid();

        business.Name = request.Name;
        business.BusinessType = request.BusinessType;
        business.Address = request.Address;
        business.Phone = request.Phone;
        business.OpeningHours = request.OpeningHours;
        business.IsActive = request.IsActive;

        await _businessRepository.UpdateAsync(business, ct);

        return Ok(new BusinessDto
        {
            Id = business.Id,
            CompanyId = business.CompanyId,
            Name = business.Name,
            BusinessType = business.BusinessType,
            Address = business.Address,
            Phone = business.Phone,
            OpeningHours = business.OpeningHours,
            IsActive = business.IsActive
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBusiness(int id, CancellationToken ct)
    {
        if (!IsAdmin()) return Forbid();

        var business = await _businessRepository.GetByIdAsync(id, ct);
        if (business == null) return NotFound();

        if (business.CompanyId != GetCompanyId()) return Forbid();

        business.IsActive = false;
        await _businessRepository.UpdateAsync(business, ct);

        return NoContent();
    }
}
