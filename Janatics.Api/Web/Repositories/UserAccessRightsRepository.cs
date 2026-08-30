using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories;

public class UserAccessRightsRepository
{
    private readonly IDbConnectionFactory _factory;
    public UserAccessRightsRepository(IDbConnectionFactory factory) => _factory = factory;

    private class FlatRow : OrgUnitLine
    {
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? RoleName { get; set; }
        public string AccessChannel { get; set; } = "SYSTEM";
        public string Status { get; set; } = "ACTIVE";
        public string? Remarks { get; set; }
    }

    private async Task<IEnumerable<OrgUnitLine>> QueryRowsAsync(IDbConnection conn, int requestingUserId, int? userId)
    {
        var p = new OracleDynamicParameters();
        p.Add("P_REQUESTING_USER_ID", requestingUserId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<FlatRow>("JAN_PKG_JAN_USER_ACCESS_RIGHTS.P_LIST_ACCESS_RIGHTS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<UserAccessRightsModel>> ListAsync(int requestingUserId)
    {
        using var conn = _factory.CreateConnection();
        var rows = (await QueryRowsAsync(conn, requestingUserId, null)).Cast<FlatRow>().ToList();
        return rows.GroupBy(r => r.UserId).Select(GroupToModel).OrderBy(m => m.UarId);
    }

    public async Task<UserAccessRightsModel?> GetByUserAsync(int requestingUserId, int userId)
    {
        using var conn = _factory.CreateConnection();
        var rows = (await QueryRowsAsync(conn, requestingUserId, userId)).Cast<FlatRow>().ToList();
        if (rows.Count == 0) return null;
        return GroupToModel(rows.GroupBy(r => r.UserId).First());
    }

    private static UserAccessRightsModel GroupToModel(IGrouping<int, FlatRow> group)
    {
        var first = group.First();
        return new UserAccessRightsModel
        {
            UarId = group.Min(r => r.UarId),
            UserId = group.Key,
            UserName = first.UserName,
            AccessChannel = first.AccessChannel,
            Status = first.Status,
            Remarks = first.Remarks,
            OrgUnitsSelected = group.Count(),
            TotalOrgUnits = 0,
            OrgUnits = group.Select(r => new OrgUnitLine
            {
                UarId = r.UarId,
                OperatingUnit = r.OperatingUnit,
                OperatingUnitName = r.OperatingUnitName,
                OrganizationId = r.OrganizationId,
                OrganizationCode = r.OrganizationCode,
                LimitValue = r.LimitValue,
            }).ToList(),
        };
    }

    public async Task<ProcedureResult> SaveAsync(UserAccessRightsModel m, string userName, int requestingUserId)
    {
        using var conn = _factory.CreateConnection();
        // The FIRST call's authorization check gates the whole save - if
        // the requester can't manage this user's access rights, every
        // subsequent call for the same user would fail the same way, so
        // checking once up front avoids partial saves that fail loudly
        // one row at a time.
        var existingRows = (await QueryRowsAsync(conn, requestingUserId, m.UserId)).ToList();
        var keepOrganizationIds = m.OrgUnits.Select(o => o.OrganizationId).ToHashSet();

        var savedCount = 0;
        var failCount = 0;
        int? firstUarId = null;
        string? firstFailureMessage = null;

        foreach (var line in m.OrgUnits)
        {
            var p = new OracleDynamicParameters();
            p.Add("P_REQUESTING_USER_ID", requestingUserId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_USER_ID", m.UserId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_OPERATING_UNIT", line.OperatingUnit, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_ORGANIZATION_ID", line.OrganizationId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_LIMIT_VALUE", line.LimitValue, OracleMappingType.Decimal, ParameterDirection.Input);
            p.Add("P_ACCESS_CHANNEL", m.AccessChannel, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_STATUS", m.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_REMARKS", m.Remarks, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_USER_NAME", userName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_UAR_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.ExecuteAsync("JAN_PKG_JAN_USER_ACCESS_RIGHTS.P_SAVE_ACCESS_RIGHTS", p, commandType: CommandType.StoredProcedure);

            if (p.Get<int>("P_RESULT_CODE") == 1) { savedCount++; firstUarId ??= p.Get<int?>("P_UAR_ID"); }
            else { failCount++; firstFailureMessage ??= p.Get<string>("P_RESULT_MSG"); }
        }

        foreach (var stale in existingRows.Where(r => !keepOrganizationIds.Contains(r.OrganizationId)))
        {
            var p = new OracleDynamicParameters();
            p.Add("P_UAR_ID", stale.UarId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.ExecuteAsync("JAN_PKG_JAN_USER_ACCESS_RIGHTS.P_DELETE_ACCESS_RIGHTS", p, commandType: CommandType.StoredProcedure);
        }

        if (failCount > 0)
            return new ProcedureResult { Success = false, Message = firstFailureMessage ?? $"Completed with errors: {savedCount}/{m.OrgUnits.Count} locations saved." };

        return new ProcedureResult { Success = true, Message = "User access rights saved successfully.", NewId = firstUarId };
    }

    public async Task<ProcedureResult> DeleteAllForUserAsync(int userId, int requestingUserId)
    {
        using var conn = _factory.CreateConnection();
        var rows = (await QueryRowsAsync(conn, requestingUserId, userId)).ToList();
        if (rows.Count == 0) return new ProcedureResult { Success = false, Message = "Access rights record not found, or you do not have permission to view it." };

        foreach (var row in rows)
        {
            var p = new OracleDynamicParameters();
            p.Add("P_UAR_ID", row.UarId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.ExecuteAsync("JAN_PKG_JAN_USER_ACCESS_RIGHTS.P_DELETE_ACCESS_RIGHTS", p, commandType: CommandType.StoredProcedure);
        }
        return new ProcedureResult { Success = true, Message = "User access rights deleted successfully." };
    }
}
