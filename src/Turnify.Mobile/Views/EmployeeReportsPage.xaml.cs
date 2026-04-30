using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class EmployeeReportsPage : ContentPage
{
    public EmployeeReportsPage(EmployeeReportsViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
