using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class VacationEditPage : ContentPage
{
    private readonly VacationEditViewModel _viewModel;

    public VacationEditPage(VacationEditViewModel viewModel)
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
