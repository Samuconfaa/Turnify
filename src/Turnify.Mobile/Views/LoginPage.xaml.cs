using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage(LoginViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    private void OnAdminTabTapped(object? sender, EventArgs e)
    {
        if (BindingContext is LoginViewModel vm) vm.IsEmployeeMode = false;
    }

    private void OnEmployeeTabTapped(object? sender, EventArgs e)
    {
        if (BindingContext is LoginViewModel vm) vm.IsEmployeeMode = true;
    }
}
