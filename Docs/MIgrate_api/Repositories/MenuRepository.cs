using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories;

public class MenuRepository
{
    private readonly IDbConnectionFactory _factory;
    public MenuRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IEnumerable<MenuModel>> ListAsync(int? moduleId = null)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MODULE_ID", moduleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<MenuModel>("JAN_PKG_JAN_MENU_MASTER.P_LIST_MENUS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<MenuModel?> GetAsync(int menuId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MENU_ID", menuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        var rows = await conn.QueryAsync<MenuModel>("JAN_PKG_JAN_MENU_MASTER.P_GET_MENU", p, commandType: CommandType.StoredProcedure);
        return rows.FirstOrDefault();
    }

    public async Task<ProcedureResult> CreateAsync(MenuModel m, string createdBy)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MENU_CODE", null, OracleMappingType.Varchar2, ParameterDirection.Input); // always auto-generated
        p.Add("P_MENU_NAME", m.DisplayName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_DISPLAY_NAME", m.DisplayName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_MODULE_ID", m.ModuleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_PARENT_MENU_ID", m.ParentMenuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MENU_TYPE", m.MenuType, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_NATURE", m.Nature, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_SORT_ORDER", m.SortOrder, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_STATUS", m.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_CREATED_BY", createdBy, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_NEW_MENU_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MENU_MASTER.P_INSERT_MENU", p, commandType: CommandType.StoredProcedure);
        var success = p.Get<int>("P_RESULT_CODE") == 1;
        var newId = p.Get<int?>("P_NEW_MENU_ID");
        return new ProcedureResult
        {
            Success = success, Message = p.Get<string>("P_RESULT_MSG"), NewId = newId,
            GeneratedCode = (success && newId.HasValue) ? $"MNU{newId.Value:D3}" : null,
        };
    }

    public async Task<ProcedureResult> UpdateAsync(int menuId, MenuModel m, string modifiedBy)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MENU_ID", menuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MENU_NAME", m.DisplayName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_DISPLAY_NAME", m.DisplayName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_MODULE_ID", m.ModuleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_PARENT_MENU_ID", m.ParentMenuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MENU_TYPE", m.MenuType, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_NATURE", m.Nature, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_SORT_ORDER", m.SortOrder, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_STATUS", m.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_MODIFIED_BY", modifiedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MENU_MASTER.P_UPDATE_MENU", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }

    public async Task<ProcedureResult> DeleteAsync(int menuId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MENU_ID", menuId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MENU_MASTER.P_DELETE_MENU", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }
}
