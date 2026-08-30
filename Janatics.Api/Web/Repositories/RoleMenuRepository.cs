using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories;

public class RoleMenuRepository
{
    private readonly IDbConnectionFactory _factory;
    public RoleMenuRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IEnumerable<RoleMenuModel>> ListAsync(int? roleId = null)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<RoleMenuModel>("JAN_PKG_JAN_ROLE_MENU.P_LIST_PERMISSIONS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<ModuleAccessModel>> ListModuleAccessAsync(int? roleId = null)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<ModuleAccessModel>("JAN_PKG_JAN_ROLE_MENU.P_LIST_MODULE_ACCESS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IReadOnlyList<string>> GetRestrictedColumnsAsync(int roleId, int menuId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MENU_ID", menuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_RETURN_VALUE", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 1000);
        await conn.ExecuteAsync(
            "BEGIN :P_RETURN_VALUE := JAN_PKG_JAN_ROLE_MENU.F_GET_RESTRICTED_COLUMNS(:P_ROLE_ID, :P_MENU_ID); END;",
            p, commandType: CommandType.Text);
        var raw = p.Get<string?>("P_RETURN_VALUE");
        if (string.IsNullOrWhiteSpace(raw)) return Array.Empty<string>();
        return raw.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
    }

    public async Task<ProcedureResult> SaveAsync(RoleMenuModel m, string userName)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_ROLE_ID", m.RoleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MODULE_ID", m.ModuleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MENU_ID", m.MenuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_PERM_VIEW", m.PermView, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_PERM_ADD", m.PermAdd, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_PERM_EDIT", m.PermEdit, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_PERM_DELETE", m.PermDelete, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_PERM_EXPORT", m.PermExport, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_PERM_APPROVE", m.PermApprove, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_RESTRICTED_COLUMNS", m.RestrictedColumns, OracleMappingType.Varchar2, ParameterDirection.Input, size: 1000);
        p.Add("P_USER_NAME", userName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_ROLE_MENU.P_SAVE_PERMISSION", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }

    public async Task<ProcedureResult> DeleteAsync(int roleMenuId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_ROLE_MENU_ID", roleMenuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_ROLE_MENU.P_DELETE_PERMISSION", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }
}
