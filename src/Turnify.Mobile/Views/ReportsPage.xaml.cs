using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ReportsPage : ContentPage
{
    public ReportsPage(ReportsViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
