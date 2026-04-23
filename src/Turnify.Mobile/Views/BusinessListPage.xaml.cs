using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class BusinessListPage : ContentPage
{
    public BusinessListPage(BusinessListViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is BusinessListViewModel vm)
            vm.LoadCommand.Execute(null);
    }
}
