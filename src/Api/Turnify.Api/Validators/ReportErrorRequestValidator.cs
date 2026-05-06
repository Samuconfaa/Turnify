using FluentValidation;
using Turnify.Api.DTOs;

namespace Turnify.Api.Validators;

public class ReportErrorRequestValidator : AbstractValidator<ReportErrorRequest>
{
    public ReportErrorRequestValidator()
    {
        RuleFor(x => x.DeviceId)
            .NotEmpty().WithMessage("DeviceId è obbligatorio.")
            .MaximumLength(200);

        RuleFor(x => x.Platform)
            .NotEmpty().WithMessage("Platform è obbligatoria.")
            .Must(p => p is "Android" or "iOS" or "Windows" or "macOS")
            .WithMessage("Platform deve essere Android, iOS, Windows o macOS.");

        RuleFor(x => x.AppVersion)
            .NotEmpty().WithMessage("AppVersion è obbligatoria.")
            .MaximumLength(50);

        RuleFor(x => x.ErrorType)
            .NotEmpty().WithMessage("ErrorType è obbligatorio.")
            .MaximumLength(200);

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Il messaggio di errore è obbligatorio.")
            .MaximumLength(2000);

        RuleFor(x => x.StackTrace)
            .MaximumLength(10000).When(x => x.StackTrace != null);

        RuleFor(x => x.ScreenName)
            .MaximumLength(200).When(x => x.ScreenName != null);
    }
}
