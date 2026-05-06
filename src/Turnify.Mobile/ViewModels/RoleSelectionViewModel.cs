using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;
using Turnify.Mobile.Views;

namespace Turnify.Mobile.ViewModels;

public partial class RoleSelectionViewModel : BaseViewModel
{
    public RoleSelectionViewModel()
    {
        Title = "Turnify";
    }

    [RelayCommand]
    private async Task GoToAdminLoginAsync()
        => await Shell.Current.GoToAsync($"{nameof(LoginPage)}?isEmployee=false");

    [RelayCommand]
    private async Task GoToEmployeeLoginAsync()
        => await Shell.Current.GoToAsync($"{nameof(LoginPage)}?isEmployee=true");

    [RelayCommand]
    private async Task GoToRegisterAsync()
        => await Shell.Current.GoToAsync(nameof(RegisterPage));
}
