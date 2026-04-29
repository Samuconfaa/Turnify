using FluentValidation;
using Turnify.Api.Controllers;

namespace Turnify.Api.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("L'email è obbligatoria.")
            .EmailAddress().WithMessage("Formato email non valido.")
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La password è obbligatoria.")
            .MinimumLength(6).WithMessage("La password deve essere di almeno 6 caratteri.")
            .MaximumLength(128);
    }
}
