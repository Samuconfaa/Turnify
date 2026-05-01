using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ShiftSwapRequestPage : ContentPage
{
    private readonly ShiftSwapRequestViewModel _viewModel;

    public ShiftSwapRequestPage(ShiftSwapRequestViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = _viewModel = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.OnAppearingAsync();
    }
}
