using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class EmojiPickerPage : ContentPage
{
    public EmojiPickerPage(EmojiPickerViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
