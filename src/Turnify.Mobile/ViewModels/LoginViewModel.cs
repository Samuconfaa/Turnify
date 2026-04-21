using System.Threading.Tasks;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Maui.Controls;

namespace Turnify.Mobile.ViewModels;

public partial class LoginViewModel : BaseViewModel
{
    public LoginViewModel()
    {
        Title = "Login";
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        IsBusy = true;
        await Task.Delay(500); // Mock authentication
        
        // Mock set role
        if (Application.Current?.MainPage is AppShell shell)
        {
            shell.ConfigureForRole(isAdmin: true);
        }
        
        await Shell.Current.GoToAsync("//Dashboard");
        IsBusy = false;
    }
}
