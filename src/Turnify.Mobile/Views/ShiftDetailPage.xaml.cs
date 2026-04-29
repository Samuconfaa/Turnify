using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ShiftDetailPage : ContentPage
{
    public ShiftDetailPage(ShiftDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is ShiftDetailViewModel vm)
            vm.LoadDataCommand.Execute(null);
    }
}
