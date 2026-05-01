using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ShiftSwapsPage : ContentPage
{
    private readonly ShiftSwapsViewModel _viewModel;

    public ShiftSwapsPage(ShiftSwapsViewModel viewModel)
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
