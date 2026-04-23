using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class EmployeeDetailPage : ContentPage
{
    public EmployeeDetailPage(EmployeeDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        // Reload businesses in case one was just created
        if (BindingContext is EmployeeDetailViewModel vm)
            vm.LoadDataCommand.Execute(null);
    }

    private void OnContractTypeChanged(object? sender, EventArgs e)
    {
        if (sender is Picker picker && BindingContext is EmployeeDetailViewModel vm)
        {
            vm.SelectedContractType = picker.SelectedIndex switch
            {
                0 => "FullTime",
                1 => "PartTime",
                2 => "Apprenticeship",
                3 => "FixedTerm",
                4 => "OnCall",
                _ => "FullTime"
            };
        }
    }
}
