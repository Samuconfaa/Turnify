using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class VacationListPage : ContentPage
{
    public VacationListPage(VacationListViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
