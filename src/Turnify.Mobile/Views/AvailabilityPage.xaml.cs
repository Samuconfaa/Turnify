using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class AvailabilityPage : ContentPage
{
    public AvailabilityPage(AvailabilityViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is AvailabilityViewModel vm)
            vm.LoadCommand.Execute(null);
    }
}
