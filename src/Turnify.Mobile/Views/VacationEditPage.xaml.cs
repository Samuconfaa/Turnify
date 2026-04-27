using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class VacationEditPage : ContentPage
{
    public VacationEditPage(VacationEditViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
