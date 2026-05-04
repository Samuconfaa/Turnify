using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class BusinessDetailPage : ContentPage
{
    public BusinessDetailPage(BusinessDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
