namespace Turnify.Api.DTOs;

public class PaginatedResult<T>
{
    public List<T> Data { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasMore => Page * PageSize < Total;
}
