using Microsoft.Maui.Controls;
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

    private void OnVacationTypeChanged(object? sender, EventArgs e)
    {
        if (sender is Picker picker && BindingContext is VacationListViewModel vm)
        {
            vm.NewType = picker.SelectedIndex switch
            {
                0 => "Holiday",
                1 => "PaidLeave",
                2 => "SickLeave",
                3 => "UnpaidLeave",
                _ => "Holiday"
            };
        }
    }
}
