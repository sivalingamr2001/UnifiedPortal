using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories;

public class ModuleRepository
{
    private readonly IDbConnectionFactory _factory;
    public ModuleRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IEnumerable<ModuleModel>> ListAsync()
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<ModuleModel>("JAN_PKG_JAN_MODULE_MASTER.P_LIST_MODULES", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<ModuleModel?> GetAsync(int moduleId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MODULE_ID", moduleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        var rows = await conn.QueryAsync<ModuleModel>("JAN_PKG_JAN_MODULE_MASTER.P_GET_MODULE", p, commandType: CommandType.StoredProcedure);
        return rows.FirstOrDefault();
    }

    public async Task<ProcedureResult> CreateAsync(ModuleModel m, string createdBy)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MODULE_CODE", null, OracleMappingType.Varchar2, ParameterDirection.Input); // always auto-generated
        p.Add("P_MODULE_NAME", m.ModuleName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_DEFAULT_MENU", m.DefaultMenu, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_SORT_ORDER", m.SortOrder, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_REMARKS", m.Remarks, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_STATUS", m.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_CREATED_BY", createdBy, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_NEW_MODULE_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MODULE_MASTER.P_INSERT_MODULE", p, commandType: CommandType.StoredProcedure);
        var success = p.Get<int>("P_RESULT_CODE") == 1;
        var newId = p.Get<int?>("P_NEW_MODULE_ID");
        return new ProcedureResult
        {
            Success = success, Message = p.Get<string>("P_RESULT_MSG"), NewId = newId,
            GeneratedCode = (success && newId.HasValue) ? $"MOD{newId.Value:D3}" : null,
        };
    }

    public async Task<ProcedureResult> UpdateAsync(int moduleId, ModuleModel m, string modifiedBy)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MODULE_ID", moduleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_MODULE_NAME", m.ModuleName, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_DEFAULT_MENU", m.DefaultMenu, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_SORT_ORDER", m.SortOrder, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_REMARKS", m.Remarks, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_STATUS", m.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_MODIFIED_BY", modifiedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MODULE_MASTER.P_UPDATE_MODULE", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }

    public async Task<ProcedureResult> DeleteAsync(int moduleId)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_MODULE_ID", moduleId, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
        p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
        await conn.ExecuteAsync("JAN_PKG_JAN_MODULE_MASTER.P_DELETE_MODULE", p, commandType: CommandType.StoredProcedure);
        return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
    }
}
