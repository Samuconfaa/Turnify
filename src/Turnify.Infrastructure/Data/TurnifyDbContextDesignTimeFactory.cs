using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Turnify.Infrastructure.Data;

public class TurnifyDbContextDesignTimeFactory : IDesignTimeDbContextFactory<TurnifyDbContext>
{
    public TurnifyDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<TurnifyDbContext>()
            .UseMySql(
                "Server=localhost;Database=turnify_dev;User=root;Password=placeholder;",
                new MySqlServerVersion(new Version(8, 0, 0)))
            .Options;
        return new TurnifyDbContext(options);
    }
}
