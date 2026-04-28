using FluentValidation;
using Turnify.Api.DTOs;

namespace Turnify.Api.Validators;

public class CreateVacationRequestValidator : AbstractValidator<CreateVacationRequest>
{
    public CreateVacationRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("EmployeeId deve essere un valore positivo.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("La data di inizio è obbligatoria.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("La data di fine è obbligatoria.")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("La data di fine non può essere precedente alla data di inizio.");

        RuleFor(x => x.TotalDays)
            .GreaterThan(0).WithMessage("Il numero di giorni deve essere maggiore di zero.")
            .LessThanOrEqualTo(365).WithMessage("Non è possibile richiedere più di 365 giorni consecutivi.");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("Il motivo non può superare 500 caratteri.");
    }
}
