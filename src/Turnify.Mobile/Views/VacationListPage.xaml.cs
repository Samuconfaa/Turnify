using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class VacationListPage : ContentPage
{
    private readonly VacationListViewModel _viewModel;

    public VacationListPage(VacationListViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _viewModel.OnAppearingAsync();
    }
}
