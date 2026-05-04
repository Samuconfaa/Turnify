using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SQLite;

namespace Turnify.Mobile.Services;

public class CacheService : ICacheService
{
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromMinutes(5);

    private readonly SQLiteAsyncConnection _db;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _initialized;

    public CacheService()
    {
        var dbPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "turnify_cache.db3");
        _db = new SQLiteAsyncConnection(dbPath);
    }

    private async Task EnsureInitializedAsync()
    {
        if (_initialized) return;
        await _lock.WaitAsync();
        try
        {
            if (!_initialized)
            {
                await _db.CreateTableAsync<CacheEntry>();
                _initialized = true;
            }
        }
        finally { _lock.Release(); }
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        await EnsureInitializedAsync();
        var entry = await _db.Table<CacheEntry>()
            .Where(e => e.Key == key)
            .FirstOrDefaultAsync();

        if (entry == null) return null;
        if (entry.ExpiresAtTicks < DateTime.UtcNow.Ticks)
        {
            await _db.DeleteAsync(entry);
            return null;
        }

        try { return JsonSerializer.Deserialize<T>(entry.Json); }
        catch { return null; }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null) where T : class
    {
        await EnsureInitializedAsync();
        var entry = new CacheEntry
        {
            Key          = key,
            Json         = JsonSerializer.Serialize(value),
            ExpiresAtTicks = (DateTime.UtcNow + (ttl ?? DefaultTtl)).Ticks
        };
        await _db.InsertOrReplaceAsync(entry);
    }

    public async Task InvalidateAsync(string key)
    {
        await EnsureInitializedAsync();
        await _db.Table<CacheEntry>().DeleteAsync(e => e.Key == key);
    }

    public async Task InvalidateAllAsync()
    {
        await EnsureInitializedAsync();
        await _db.DeleteAllAsync<CacheEntry>();
    }

    [Table("CacheEntries")]
    private class CacheEntry
    {
        [PrimaryKey]
        public string Key            { get; set; } = string.Empty;
        public string Json           { get; set; } = string.Empty;
        public long   ExpiresAtTicks { get; set; }
    }
}
