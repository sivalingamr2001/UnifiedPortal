using ConnectionDll;
using Oracle.ManagedDataAccess.Client;
using System.Data;

namespace JanaticsAdminPortal.API.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}

/// <summary>
/// Minimal connection factory used by every Dapper-based repository in
/// this project (RoleRepository, ModuleRepository, etc.). If you're
/// switching to OracleDb (see OracleDb.cs) for some or all data access,
/// that class resolves its OWN connection string independently - it does
/// not use this factory. Keep both reading from the SAME property
/// (oracondev, confirmed with the user) so there's exactly one source of
/// truth for which environment this API talks to.
/// </summary>
public class OracleConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public OracleConnectionFactory(ILogger<OracleConnectionFactory> log)
    {
        var dll = new Class1();

        if (dll?.oracon == null)
            throw new InvalidOperationException(
                "OraConnection.Class1.oracondev is null. " +
                "Check that OraConnection.dll is referenced and configured correctly.");

        _connectionString = dll.oracon.ConnectionString;

        if (string.IsNullOrWhiteSpace(_connectionString))
            throw new InvalidOperationException("OraConnection returned an empty connection string.");

        log.LogInformation("[OracleConnectionFactory] Initialised successfully.");
    }

    public IDbConnection CreateConnection()
    {
        var connection = new OracleConnection(_connectionString);
        connection.Open();
        return connection;
    }
}
