using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class GdprConsentPage : ContentPage
{
    public GdprConsentPage(GdprConsentViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
