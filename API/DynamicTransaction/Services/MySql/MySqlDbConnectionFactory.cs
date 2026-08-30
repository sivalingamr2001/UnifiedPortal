using System.Data;
using DynamicTransaction.Interfaces;
using MySqlConnector;

namespace DynamicTransaction.Services.MySql;

public sealed class MySqlDbConnectionFactory(string defaultConnectionString) : IDbConnectionFactory
{
    private readonly string _defaultConnectionString = defaultConnectionString;

    public IAsyncDbConnectionWrapper CreateConnection(string? connectionStringOverride = null)
    {
        var connectionString = connectionStringOverride ?? _defaultConnectionString;

        IDbConnection connection = new MySqlConnection(connectionString);

        return new AsyncDbConnectionWrapper(connection);
    }
}
