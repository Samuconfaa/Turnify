using Microsoft.Maui.Controls;
using Turnify.Mobile.ViewModels;

namespace Turnify.Mobile.Views;

public partial class ShiftDetailPage : ContentPage
{
    public ShiftDetailPage(ShiftDetailViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is ShiftDetailViewModel vm)
            vm.LoadDataCommand.Execute(null);
    }

    private void OnRepeatIncrement(object? sender, EventArgs e)
    {
        if (BindingContext is ShiftDetailViewModel vm && vm.RepeatWeeks < 12)
            vm.RepeatWeeks++;
    }

    private void OnRepeatDecrement(object? sender, EventArgs e)
    {
        if (BindingContext is ShiftDetailViewModel vm && vm.RepeatWeeks > 0)
            vm.RepeatWeeks--;
    }
}
