using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

/// <summary>
/// Pagina "Gestisci i tuoi dati" accessibile da Profilo.
/// Mostra opzioni GDPR: esportazione dati e cancellazione account.
/// La UI verrà generata da Stitch e convertita in XAML.
/// Per ora implementa la logica; il markup XAML arriverà dopo Stitch.
/// </summary>
public partial class ManageDataPage : ContentPage
{
    public ManageDataPage(GdprConsentViewModel viewModel)
    {
        // XAML temporaneo inline fino a quando Stitch genera la UI definitiva
        Title          = "Gestisci i tuoi dati";
        BackgroundColor = Color.FromArgb("#F9FAFB");
        BindingContext  = viewModel;

        var stack = new VerticalStackLayout
        {
            Spacing = 20,
            Padding = new Thickness(20)
        };

        stack.Add(new Label
        {
            Text      = "🛡️ I tuoi dati",
            FontSize  = 24,
            FontAttributes = FontAttributes.Bold,
            HorizontalOptions = LayoutOptions.Center,
            Margin    = new Thickness(0, 20, 0, 0)
        });

        stack.Add(new Label
        {
            Text     = "Hai il diritto di accedere, portare o cancellare i tuoi dati " +
                       "personali in qualsiasi momento (GDPR Art. 15, 17, 20).",
            FontSize = 14,
            TextColor = Color.FromArgb("#6B7280"),
            HorizontalTextAlignment = TextAlignment.Center
        });

        var exportBtn = new Button
        {
            Text            = "📥  Esporta i miei dati",
            BackgroundColor = Color.FromArgb("#2563EB"),
            TextColor       = Colors.White,
            CornerRadius    = 10,
            HeightRequest   = 50
        };
        exportBtn.SetBinding(Button.CommandProperty, nameof(GdprConsentViewModel.ExportDataCommand));
        stack.Add(exportBtn);

        var deleteBtn = new Button
        {
            Text            = "🗑️  Elimina il mio account",
            BackgroundColor = Colors.Transparent,
            TextColor       = Color.FromArgb("#DC2626"),
            BorderColor     = Color.FromArgb("#DC2626"),
            BorderWidth     = 1.5,
            CornerRadius    = 10,
            HeightRequest   = 50
        };
        deleteBtn.SetBinding(Button.CommandProperty,
            nameof(GdprConsentViewModel.RequestAccountDeletionCommand));
        stack.Add(deleteBtn);

        stack.Add(new Label
        {
            Text     = "Per qualsiasi richiesta relativa alla privacy puoi contattarci a " +
                       "privacy@turnify.it",
            FontSize = 12,
            TextColor = Color.FromArgb("#9CA3AF"),
            HorizontalTextAlignment = TextAlignment.Center,
            Margin   = new Thickness(0, 12, 0, 0)
        });

        Content = new ScrollView { Content = stack };
    }
}
