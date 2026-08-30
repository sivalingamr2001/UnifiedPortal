using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Dapper.Oracle;
using DynamicTransaction.Interfaces;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories
{
    public class RoleRepository
    {
        private readonly IDbConnectionFactory _factory;
        public RoleRepository(IDbConnectionFactory factory) => _factory = factory;

        public async Task<IEnumerable<RoleModel>> ListAsync()
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            return await conn.Connection.QueryAsync<RoleModel>("JAN_PKG_JAN_ROLE_MASTER.P_LIST_ROLES", p, commandType: CommandType.StoredProcedure);
        }

        public async Task<RoleModel?> GetAsync(int roleId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            var rows = await conn.Connection.QueryAsync<RoleModel>("JAN_PKG_JAN_ROLE_MASTER.P_GET_ROLE", p, commandType: CommandType.StoredProcedure);
            return rows.FirstOrDefault();
        }

        public async Task<ProcedureResult> CreateAsync(RoleModel role, string createdBy)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_ROLE_CODE", null, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_ROLE_NAME", role.RoleName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_SOURCE_TYPE", role.SourceType, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_REMARKS", role.Remarks, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_STATUS", role.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_CREATED_BY", createdBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_NEW_ROLE_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_ROLE_MASTER.P_INSERT_ROLE", p, commandType: CommandType.StoredProcedure);
            var success = p.Get<int>("P_RESULT_CODE") == 1;
            var newId = p.Get<int?>("P_NEW_ROLE_ID");
            return new ProcedureResult
            {
                Success = success,
                Message = p.Get<string>("P_RESULT_MSG"),
                NewId = newId,
                GeneratedCode = (success && newId.HasValue) ? $"ROL{newId.Value:D3}" : null,
            };
        }

        public async Task<ProcedureResult> UpdateAsync(int roleId, RoleModel role, string modifiedBy)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_ROLE_NAME", role.RoleName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_SOURCE_TYPE", role.SourceType, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_REMARKS", role.Remarks, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_STATUS", role.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_MODIFIED_BY", modifiedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_ROLE_MASTER.P_UPDATE_ROLE", p, commandType: CommandType.StoredProcedure);
            return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
        }

        public async Task<ProcedureResult> DeleteAsync(int roleId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_ROLE_ID", roleId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_ROLE_MASTER.P_DELETE_ROLE", p, commandType: CommandType.StoredProcedure);
            return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
        }
    }
}
