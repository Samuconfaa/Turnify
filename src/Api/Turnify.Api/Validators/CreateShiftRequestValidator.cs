using FluentValidation;
using Turnify.Api.DTOs;

namespace Turnify.Api.Validators;

public class CreateShiftRequestValidator : AbstractValidator<CreateShiftRequest>
{
    public CreateShiftRequestValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("EmployeeId deve essere un valore positivo.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("L'orario di inizio è obbligatorio.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("L'orario di fine è obbligatorio.")
            .GreaterThan(x => x.StartTime).WithMessage("L'orario di fine deve essere successivo all'orario di inizio.");

        RuleFor(x => x.EndTime)
            .Must((req, end) => (end - req.StartTime).TotalHours <= 24)
            .WithMessage("Un turno non può durare più di 24 ore.");

        RuleFor(x => x.Label)
            .MaximumLength(100).WithMessage("L'etichetta non può superare 100 caratteri.");

        RuleFor(x => x.Note)
            .MaximumLength(500).WithMessage("La nota non può superare 500 caratteri.");
    }
}
