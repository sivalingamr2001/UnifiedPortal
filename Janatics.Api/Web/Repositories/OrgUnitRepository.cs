using System.Data;
using Dapper;
using Dapper.Oracle;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories;

public class OrgUnitRepository
{
    private readonly IDbConnectionFactory _factory;
    public OrgUnitRepository(IDbConnectionFactory factory) => _factory = factory;

    public async Task<IEnumerable<OperatingUnitModel>> ListOperatingUnitsAsync()
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<OperatingUnitModel>("JAN_PKG_JAN_ORG_UNIT.P_LIST_OPERATING_UNITS", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<OrganizationModel>> ListOrganizationsAsync(int operatingUnit)
    {
        using var conn = _factory.CreateConnection();
        var p = new OracleDynamicParameters();
        p.Add("P_OPERATING_UNIT", operatingUnit, OracleMappingType.Int32, ParameterDirection.Input);
        p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
        return await conn.QueryAsync<OrganizationModel>("JAN_PKG_JAN_ORG_UNIT.P_LIST_ORGANIZATIONS_BY_OU", p, commandType: CommandType.StoredProcedure);
    }
}
