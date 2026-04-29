# ListView to CollectionView Migration

Use this note only for legacy MAUI pages that already depend on `ListView`.

For new code, use `CollectionView` directly.

## Migration intent

When a page still uses `ListView`, propose migration to `CollectionView` unless the user asks for a minimal maintenance-only fix.

## What to preserve during migration

- `ItemsSource` binding
- item template layout and compiled bindings
- refresh behavior
- empty, loading, error, and data states
- selection or tap commands
- Shell-based navigation behavior

## Typical migration shape

Replace patterns like this:

```xml
<ListView
    ItemsSource="{Binding Orders}"
    IsPullToRefreshEnabled="True"
    IsRefreshing="{Binding IsBusy}"
    RefreshCommand="{Binding RefreshCommand}">
    <ListView.ItemTemplate>
        <DataTemplate x:DataType="viewmodels:OrderListItem">
            <ViewCell>
                <Label Text="{Binding Number}" />
            </ViewCell>
        </DataTemplate>
    </ListView.ItemTemplate>
</ListView>
```

With a `RefreshView` + `CollectionView` pattern like this:

```xml
<RefreshView
    Command="{Binding RefreshCommand}"
    IsRefreshing="{Binding IsBusy}">
    <CollectionView ItemsSource="{Binding Orders}" SelectionMode="None">
        <CollectionView.ItemTemplate>
            <DataTemplate x:DataType="viewmodels:OrderListItem">
                <Label Text="{Binding Number}" />
            </DataTemplate>
        </CollectionView.ItemTemplate>
    </CollectionView>
</RefreshView>
```

After migrating, verify pull-to-refresh, scrolling behavior, template sizing, and item interaction on Android.
