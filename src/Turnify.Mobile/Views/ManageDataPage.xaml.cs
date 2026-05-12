using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ManageDataPage : ContentPage
{
    public ManageDataPage(GdprConsentViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
