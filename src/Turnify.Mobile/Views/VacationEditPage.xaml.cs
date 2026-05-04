using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class VacationEditPage : ContentPage
{
    public VacationEditPage(VacationEditViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    private void OnTypeChanged(object? sender, EventArgs e)
    {
        if (sender is Picker p && BindingContext is VacationEditViewModel vm)
            vm.SelectedType = p.SelectedIndex switch
            {
                0 => "Holiday", 1 => "PaidLeave",
                2 => "SickLeave", 3 => "UnpaidLeave",
                _ => "Holiday"
            };
    }

    private void OnStatusChanged(object? sender, EventArgs e)
    {
        if (sender is Picker p && BindingContext is VacationEditViewModel vm)
            vm.SelectedStatus = p.SelectedIndex switch
            {
                0 => "Pending", 1 => "Approved",
                2 => "Rejected", 3 => "Cancelled",
                _ => "Pending"
            };
    }
}
