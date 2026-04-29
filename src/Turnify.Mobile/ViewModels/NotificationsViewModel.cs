using System;
using System.Collections.ObjectModel;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using CommunityToolkit.Mvvm.Messaging.Messages;

namespace Turnify.Mobile.ViewModels;

public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }

    public string TimeAgo
    {
        get
        {
            var diff = DateTime.UtcNow - CreatedAt;
            if (diff.TotalMinutes < 1)  return "Adesso";
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} min fa";
            if (diff.TotalHours   < 24) return $"{(int)diff.TotalHours} ore fa";
            if (diff.TotalDays    < 7)  return $"{(int)diff.TotalDays} giorni fa";
            return CreatedAt.ToLocalTime().ToString("dd MMM yyyy");
        }
    }

    public string Icon => Type switch
    {
        "ShiftCreated"      => "📅",
        "ShiftModified"     => "✏️",
        "ShiftCancelled"    => "❌",
        "VacationApproved"  => "✅",
        "VacationRejected"  => "❌",
        "General"           => "📢",
        _                   => "🔔"
    };

    public string BackgroundColor => IsRead
        ? "Transparent"
        : "#F0F7FF";
}

public partial class NotificationsViewModel : BaseViewModel
{
    private readonly HttpClient _httpClient;

    public ObservableCollection<NotificationDto> Notifications { get; } = new();

    [ObservableProperty] private bool _hasError;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isEmptyState;
    [ObservableProperty] private bool _hasData;
    [ObservableProperty] private int _unreadCount;

    public NotificationsViewModel(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("TurnifyApi");
        Title = "Notifiche";
    }

    public async Task OnAppearingAsync() => await LoadAsync();

    [RelayCommand]
    public async Task LoadAsync()
    {
        if (IsBusy) return;
        HasError = false;
        ErrorMessage = string.Empty;
        try
        {
            IsBusy = true;
            var result = await _httpClient.GetFromJsonAsync<NotificationsResponse>(
                "api/notifications?pageSize=50");

            Notifications.Clear();
            if (result?.Data != null)
                foreach (var n in result.Data) Notifications.Add(n);

            UnreadCount  = result?.UnreadCount ?? 0;
            HasData      = Notifications.Count > 0;
            IsEmptyState = Notifications.Count == 0;

            WeakReferenceMessenger.Default.Send(new ValueChangedMessage<int>(UnreadCount));
        }
        catch (HttpRequestException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Errore di connessione al server.";
        }
        catch (System.Text.Json.JsonException ex)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Risposta del server non valida.";
            _ = ErrorReporterService.Current?.ReportAsync(ex, screenName: nameof(NotificationsViewModel));
        }
        catch (TaskCanceledException)
        {
            HasData = false;
            IsEmptyState = false;
            HasError = true;
            ErrorMessage = "Richiesta scaduta. Riprova.";
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task MarkReadAsync(NotificationDto notification)
    {
        if (notification == null || notification.IsRead) return;
        try
        {
            await _httpClient.PutAsync($"api/notifications/{notification.Id}/read", null);
            notification.IsRead = true;
            UnreadCount = System.Math.Max(0, UnreadCount - 1);
            // Refresh list to update background color
            var idx = Notifications.IndexOf(notification);
            if (idx >= 0)
            {
                Notifications.RemoveAt(idx);
                Notifications.Insert(idx, notification);
            }
        }
        catch (HttpRequestException) { }
        catch (TaskCanceledException) { }
    }

    [RelayCommand]
    private async Task MarkAllReadAsync()
    {
        try
        {
            await _httpClient.PutAsync("api/notifications/read-all", null);
            await LoadAsync();
        }
        catch (HttpRequestException) { }
        catch (TaskCanceledException) { }
    }

    private class NotificationsResponse
    {
        [JsonPropertyName("data")]
        public System.Collections.Generic.List<NotificationDto> Data { get; set; } = new();
        [JsonPropertyName("unreadCount")]
        public int UnreadCount { get; set; }
    }
}
