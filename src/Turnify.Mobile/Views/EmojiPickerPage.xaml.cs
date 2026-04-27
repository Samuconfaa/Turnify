using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class EmojiPickerPage : ContentPage
{
    public EmojiPickerPage(ProfileViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
