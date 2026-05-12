using FluentValidation;
using Turnify.Api.DTOs;

namespace Turnify.Api.Validators;

public class UpdateShiftRequestValidator : AbstractValidator<UpdateShiftRequest>
{
    public UpdateShiftRequestValidator()
    {
        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("L'orario di inizio è obbligatorio.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("L'orario di fine è obbligatorio.")
            .GreaterThan(x => x.StartTime).WithMessage("L'orario di fine deve essere successivo all'orario di inizio.");

        RuleFor(x => x.EndTime)
            .Must((req, end) => (end - req.StartTime).TotalHours <= 24)
            .WithMessage("Un turno non può durare più di 24 ore.");

        RuleFor(x => x.Label)
            .MaximumLength(100);

        RuleFor(x => x.Note)
            .MaximumLength(500);
    }
}
