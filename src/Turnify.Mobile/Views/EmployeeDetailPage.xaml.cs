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
        if (BindingContext is EmployeeDetailViewModel vm)
            vm.LoadDataCommand.Execute(null);
    }
}
