using CommunityToolkit.Mvvm.ComponentModel;

namespace Turnify.Mobile.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasStaleWarning))]
    private bool _isStale;

    public bool HasStaleWarning => IsStale;
}
