using ConnectionDll;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;
using Polly;
using Polly.CircuitBreaker;
using Polly.Retry;
using System.Data;

namespace JanaticsAdminPortal.API.Data;

/// <summary>
/// A heavier-duty Oracle access service with circuit-breaker + retry
/// resilience, raw OracleCommand/OracleParameter access, and bulk
/// array-bound execution - separate from IDbConnectionFactory /
/// OracleConnectionFactory (see DbConnectionFactory.cs), which is what
/// every Dapper-based repository in this project currently uses. This
/// class does NOT replace those repositories automatically - see the
/// architecture note in chat about whether this should coexist with or
/// replace the Dapper repository pattern project-wide.
/// </summary>
public class OracleDb
{
    private readonly string _connectionString;
    private readonly ILogger<OracleDb> _log;

    private const int CommandTimeoutSeconds = 60;
    private const int MaxConnectRetries = 2;
    private static readonly TimeSpan RetryBaseDelay = TimeSpan.FromMilliseconds(250);

    private static readonly HashSet<int> TransientOraCodes = new()
    {
        12170, 12541, 3113, 3135, 12537
    };

    // Circuit breaker: after 5 consecutive transient failures, stop
    // hammering a database that's clearly down for 15 seconds and fail
    // fast instead - protects the DB from a retry storm while recovering,
    // and protects callers from piling up on a doomed connection pool
    // instead of getting a fast, honest failure. Applies to query
    // EXECUTION, complementing the manual retry loop in OpenAsync (which
    // only covers opening the connection).
    private readonly AsyncCircuitBreakerPolicy _circuitBreaker;
    private readonly AsyncRetryPolicy _executionRetryPolicy;

    public OracleDb(ILogger<OracleDb> log)
    {
        _log = log;
        try
        {
            var dll = new Class1();

            if (dll?.oracon == null)
                throw new InvalidOperationException(
                    "OraConnection.Class1.oracondev is null. " +
                    "Check that OraConnection.dll is referenced and configured correctly.");

            _connectionString = dll.oracon.ConnectionString;

            if (string.IsNullOrWhiteSpace(_connectionString))
                throw new InvalidOperationException("OraConnection returned an empty connection string.");

            _log.LogInformation("[OracleDb] Initialised successfully.");
        }
        catch (Exception ex)
        {
            _log.LogCritical(ex, "[OracleDb] FATAL — cannot start.");
            throw;
        }

        _circuitBreaker = Policy
            .Handle<OracleException>(ex => TransientOraCodes.Contains(ex.Number))
            .CircuitBreakerAsync(
                exceptionsAllowedBeforeBreaking: 5,
                durationOfBreak: TimeSpan.FromSeconds(15),
                onBreak: (ex, duration) => _log.LogError(
                    "[OracleDb] Circuit OPEN for {Duration}s after repeated transient failures. Last: {Msg}",
                    duration.TotalSeconds, ex.Message),
                onReset: () => _log.LogInformation("[OracleDb] Circuit CLOSED — DB recovered."),
                onHalfOpen: () => _log.LogInformation("[OracleDb] Circuit HALF-OPEN — probing DB."));

        _executionRetryPolicy = Policy
            .Handle<OracleException>(ex => TransientOraCodes.Contains(ex.Number))
            .WaitAndRetryAsync(
                retryCount: 2,
                sleepDurationProvider: attempt => TimeSpan.FromMilliseconds(200 * attempt),
                onRetry: (ex, delay, attempt, _) => _log.LogWarning(
                    "[OracleDb] Transient error on execution, retry {Attempt} after {Delay}ms: {Msg}",
                    attempt, delay.TotalMilliseconds, ex.Message));
    }

    public async Task<OracleConnection> OpenAsync(CancellationToken ct = default)
    {
        Exception? last = null;

        for (int attempt = 0; attempt <= MaxConnectRetries; attempt++)
        {
            var conn = new OracleConnection(_connectionString);
            try
            {
                await conn.OpenAsync(ct);
                return conn;
            }
            catch (OracleException ex)
            {
                await conn.DisposeAsync();
                last = ex;

                var hint = ex.Number switch
                {
                    12541 => " → No listener running.",
                    1017 => " → Wrong credentials.",
                    28000 => " → Oracle account locked.",
                    28040 => " → Set SQLNET.ALLOWED_LOGON_VERSION_SERVER=8.",
                    _ => string.Empty
                };

                bool canRetry = TransientOraCodes.Contains(ex.Number) && attempt < MaxConnectRetries;

                _log.LogError(ex,
                    "[OracleDb] Connection failed ORA-{Code}{Hint} (attempt {Attempt}/{Max}, retrying={Retry})",
                    ex.Number, hint, attempt + 1, MaxConnectRetries + 1, canRetry);

                if (!canRetry)
                    throw new InvalidOperationException($"DB connection failed (ORA-{ex.Number}).{hint}", ex);

                await Task.Delay(RetryBaseDelay * (attempt + 1), ct);
            }
            catch (Exception ex)
            {
                await conn.DisposeAsync();
                _log.LogError(ex, "[OracleDb] Unexpected connection error.");
                throw;
            }
        }

        throw new InvalidOperationException("DB connection failed.", last);
    }

    private Task<T> WithResilienceAsync<T>(Func<Task<T>> action)
        => _circuitBreaker.ExecuteAsync(() => _executionRetryPolicy.ExecuteAsync(action));

    public async Task ExecuteProcedureAsync(
        OracleConnection conn, OracleTransaction? tx, string procName,
        List<OracleParameter>? prms = null, CancellationToken ct = default)
    {
        await WithResilienceAsync(async () =>
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = procName;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.BindByName = true;
            cmd.CommandTimeout = CommandTimeoutSeconds;
            if (tx != null) cmd.Transaction = tx;

            if (prms != null)
                foreach (var p in prms) cmd.Parameters.Add(p);

            await cmd.ExecuteNonQueryAsync(ct);
            return 0;
        });
    }

    public async Task<List<Dictionary<string, object?>>> QueryFunctionAsync(
        OracleConnection conn, string funcName,
        List<OracleParameter>? prms = null, CancellationToken ct = default)
    {
        return await WithResilienceAsync(async () =>
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = funcName;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.BindByName = true;
            cmd.CommandTimeout = CommandTimeoutSeconds;

            var returnParam = new OracleParameter("ret_cursor", OracleDbType.RefCursor)
            {
                Direction = ParameterDirection.ReturnValue
            };
            cmd.Parameters.Add(returnParam);

            if (prms != null)
                foreach (var p in prms) cmd.Parameters.Add(p);

            await cmd.ExecuteNonQueryAsync(ct);

            var rows = new List<Dictionary<string, object?>>();
            if (returnParam.Value is OracleRefCursor refCursor)
            {
                using var reader = refCursor.GetDataReader();
                while (reader.Read())
                {
                    var row = new Dictionary<string, object?>(reader.FieldCount, StringComparer.OrdinalIgnoreCase);
                    for (int i = 0; i < reader.FieldCount; i++)
                        row[reader.GetName(i)] = reader.IsDBNull(i) ? null : NormaliseOracleValue(reader.GetValue(i));
                    rows.Add(row);
                }
            }
            return rows;
        });
    }

    public async Task<List<Dictionary<string, object?>>> QueryAsync(
        OracleConnection conn, string sql,
        List<OracleParameter>? prms = null, CancellationToken ct = default, OracleTransaction? tx = null)
    {
        return await WithResilienceAsync(async () =>
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.BindByName = true;
            cmd.CommandTimeout = CommandTimeoutSeconds;
            if (tx != null) cmd.Transaction = tx;

            if (prms != null)
                foreach (var p in prms) cmd.Parameters.Add(p);

            await using var reader = await cmd.ExecuteReaderAsync(ct);
            var rows = new List<Dictionary<string, object?>>();

            while (await reader.ReadAsync(ct))
            {
                var row = new Dictionary<string, object?>(reader.FieldCount, StringComparer.OrdinalIgnoreCase);
                for (int i = 0; i < reader.FieldCount; i++)
                    row[reader.GetName(i)] = reader.IsDBNull(i) ? null : NormaliseOracleValue(reader.GetValue(i));
                rows.Add(row);
            }
            return rows;
        });
    }

    // NOT wrapped in the retry policy - a mutating statement that throws
    // partway through a transaction must never be silently retried by this
    // layer. The caller owns the transaction and decides whether to roll
    // back and retry the whole unit of work, or surface the error.
    // Retrying a write transparently here risks a double-write if the
    // original attempt actually succeeded server-side but the
    // acknowledgement was lost.
    public async Task<int> ExecuteAsync(
        OracleConnection conn, OracleTransaction? tx, string sql,
        List<OracleParameter>? prms = null, CancellationToken ct = default)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.BindByName = true;
        cmd.CommandTimeout = CommandTimeoutSeconds;
        if (tx != null) cmd.Transaction = tx;

        if (prms != null)
            foreach (var p in prms) cmd.Parameters.Add(p);

        return await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<int> ExecuteArrayBoundAsync(
        OracleConnection conn, OracleTransaction? tx, string sql,
        List<OracleParameter> arrayBoundParams, int rowCount, CancellationToken ct = default)
    {
        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.BindByName = true;
        cmd.CommandTimeout = CommandTimeoutSeconds;
        cmd.ArrayBindCount = rowCount;
        if (tx != null) cmd.Transaction = tx;

        foreach (var p in arrayBoundParams) cmd.Parameters.Add(p);

        return await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<object?> ScalarAsync(
        OracleConnection conn, string sql,
        List<OracleParameter>? prms = null, CancellationToken ct = default)
    {
        return await WithResilienceAsync(async () =>
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.BindByName = true;
            cmd.CommandTimeout = CommandTimeoutSeconds;

            if (prms != null)
                foreach (var p in prms) cmd.Parameters.Add(p);

            var result = await cmd.ExecuteScalarAsync(ct);
            return result == DBNull.Value ? null : result;
        });
    }

    public async Task<bool> PingAsync(CancellationToken ct = default)
    {
        try
        {
            await using var conn = await OpenAsync(ct);
            var result = await ScalarAsync(conn, "SELECT 1 FROM DUAL", null, ct);
            return result != null;
        }
        catch
        {
            return false;
        }
    }

    private static object? NormaliseOracleValue(object? v)
    {
        return v switch
        {
            OracleDecimal d => d.IsNull ? null : ConvertOracleDecimal(d),
            OracleString s => s.IsNull ? null : (object)s.Value,
            OracleDate dt => dt.IsNull ? null : (object)dt.Value,
            OracleTimeStamp ts => ts.IsNull ? null : (object)ts.Value,
            OracleClob c => c.IsNull ? null : (object)c.Value,
            _ => v
        };
    }

    private static object ConvertOracleDecimal(OracleDecimal d)
    {
        try
        {
            var str = d.ToString();
            if (!str.Contains('.'))
            {
                if (d <= long.MaxValue && d >= long.MinValue)
                    return (long)d;
            }
            return (decimal)d;
        }
        catch
        {
            return d.ToString();
        }
    }
}
