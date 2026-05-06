using FluentValidation;
using Turnify.Api.DTOs;

namespace Turnify.Api.Validators;

public class CreateRecurringShiftsRequestValidator : AbstractValidator<CreateRecurringShiftsRequest>
{
    public CreateRecurringShiftsRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("EmployeeId deve essere un valore positivo.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("L'orario di inizio è obbligatorio.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("L'orario di fine è obbligatorio.")
            .GreaterThan(x => x.StartTime).WithMessage("L'orario di fine deve essere successivo all'orario di inizio.");

        RuleFor(x => x.Weeks)
            .InclusiveBetween(1, 52).WithMessage("Il numero di settimane deve essere compreso tra 1 e 52.");

        RuleFor(x => x.Label)
            .MaximumLength(100);

        RuleFor(x => x.Note)
            .MaximumLength(500);
    }
}
