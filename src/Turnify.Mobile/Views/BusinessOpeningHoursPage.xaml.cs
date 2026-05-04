using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class BusinessOpeningHoursPage : ContentPage
{
    public BusinessOpeningHoursPage(BusinessOpeningHoursViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
