using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class InviteCodePage : ContentPage
{
    public InviteCodePage(InviteCodeViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
