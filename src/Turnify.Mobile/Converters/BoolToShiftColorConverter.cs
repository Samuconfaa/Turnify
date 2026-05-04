using System;
using System.Globalization;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace Turnify.Mobile.Converters;

public class BoolToShiftColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool hasShift && hasShift)
            return Color.FromArgb("#2563EB"); // PrimaryColor
        return Color.FromArgb("#E5E7EB");     // Surface2 / vuoto
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}