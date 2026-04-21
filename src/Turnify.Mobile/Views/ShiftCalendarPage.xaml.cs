using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ShiftCalendarPage : ContentPage
{
    public ShiftCalendarPage(ShiftCalendarViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
