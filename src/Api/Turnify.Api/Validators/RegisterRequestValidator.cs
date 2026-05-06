using FluentValidation;
using Turnify.Api.Controllers;

namespace Turnify.Api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Il nome azienda è obbligatorio.")
            .MaximumLength(200);

        RuleFor(x => x.CompanySlug)
            .NotEmpty().WithMessage("Lo slug azienda è obbligatorio.")
            .Matches("^[a-z0-9-]+$").WithMessage("Lo slug può contenere solo lettere minuscole, numeri e trattini.")
            .MaximumLength(100);

        RuleFor(x => x.CompanyEmail)
            .NotEmpty().WithMessage("L'email aziendale è obbligatoria.")
            .EmailAddress().WithMessage("Formato email aziendale non valido.")
            .MaximumLength(256);

        RuleFor(x => x.AdminEmail)
            .NotEmpty().WithMessage("L'email admin è obbligatoria.")
            .EmailAddress().WithMessage("Formato email admin non valido.")
            .MaximumLength(256);

        RuleFor(x => x.AdminPassword)
            .NotEmpty().WithMessage("La password admin è obbligatoria.")
            .MinimumLength(8).WithMessage("La password admin deve essere di almeno 8 caratteri.")
            .MaximumLength(128)
            .Matches("[A-Z]").WithMessage("La password deve contenere almeno una lettera maiuscola.")
            .Matches("[0-9]").WithMessage("La password deve contenere almeno un numero.");
    }
}
