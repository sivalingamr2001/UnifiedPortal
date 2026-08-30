using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;

namespace JanaticsAdminPortal.API.Repositories;

public record CreateSessionResult(bool Allowed, string Message, int? SessionId);

public class SessionRepository
{
    private readonly IDbConnectionFactory _factory;
    public SessionRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<CreateSessionResult> TryCreateSessionAsync(
        int userId, string sessionToken, DateTime expiresAtUtc, string? ipAddress, string? machineName)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_SESSION_TOKEN", sessionToken, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_EXPIRES_AT", expiresAtUtc, OracleMappingType.Date, ParameterDirection.Input);
        p.Add("P_IP_ADDRESS", ipAddress, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_MACHINE_NAME", machineName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_NEW_SESSION_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_USER_SESSION.P_TRY_CREATE_SESSION", p, commandType: CommandType.StoredProcedure);
        var allowed = p.Get<int>("P_RESULT_CODE") == 1;
        return new CreateSessionResult(allowed, p.Get<string>("P_RESULT_MSG"), allowed ? p.Get<int?>("P_NEW_SESSION_ID") : null);
    }

    public async Task EndSessionAsync(string sessionToken)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_SESSION_TOKEN", sessionToken, OracleMappingType.Varchar2, ParameterDirection.Input);
        await conn.ExecuteAsync("JAN_PKG_JAN_USER_SESSION.P_END_SESSION", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ValidateAndTouchAsync(string sessionToken)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_SESSION_TOKEN", sessionToken, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_IS_VALID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        await conn.ExecuteAsync("JAN_PKG_JAN_USER_SESSION.P_VALIDATE_AND_TOUCH_SESSION", p, commandType: CommandType.StoredProcedure);
        return p.Get<int>("P_IS_VALID") == 1;
    }

    public async Task<IEnumerable<dynamic>> ListActiveAsync()
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync("JAN_PKG_JAN_USER_SESSION.P_LIST_ACTIVE_SESSIONS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> ForceEndAsync(int sessionId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_SESSION_ID", sessionId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_USER_SESSION.P_FORCE_END_SESSION", p, commandType: CommandType.StoredProcedure);
        return p.Get<int>("P_RESULT_CODE") == 1;
    }

    public async Task EndAllForUserAsync(int userId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
        await conn.ExecuteAsync("JAN_PKG_JAN_USER_SESSION.P_END_ALL_SESSIONS_FOR_USER", p, commandType: CommandType.StoredProcedure);
    }
}
