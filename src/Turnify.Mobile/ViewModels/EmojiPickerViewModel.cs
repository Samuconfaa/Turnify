using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Maui.Controls;
using Turnify.Mobile.Messages;

namespace Turnify.Mobile.ViewModels;

public partial class EmojiPickerViewModel : ObservableObject
{
    public string[] AvailableEmojis { get; } =
    {
        "😀","😎","🧑","👨","👩","🧔","👴","👵",
        "🐶","🐱","🦊","🐼","🐨","🦁","🐯","🐻",
        "🌟","⚡","🔥","🌈","🎯","🎸","🏆","🚀"
    };

    [ObservableProperty]
    private string? _selectedEmoji;

    partial void OnSelectedEmojiChanged(string? value)
    {
        if (string.IsNullOrEmpty(value)) return;
        WeakReferenceMessenger.Default.Send(new EmojiSelectedMessage(value));
        SelectedEmoji = null;
        _ = Shell.Current.GoToAsync("..");
    }

    [RelayCommand]
    private static async Task CloseAsync()
        => await Shell.Current.GoToAsync("..");
}
