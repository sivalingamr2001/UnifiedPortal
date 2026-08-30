using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Dapper.Oracle;
using DynamicTransaction.Interfaces;
using JanaticsAdminPortal.API.Models;
using Microsoft.Extensions.Configuration;

namespace JanaticsAdminPortal.API.Repositories
{
    public class OrgUnitRepository
    {
        private readonly IDbConnectionFactory _factory;
        private readonly bool _isOracle;

        public OrgUnitRepository(IDbConnectionFactory factory, IConfiguration configuration)
        {
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
            var provider = configuration["ConnectionStrings:Provider"];
            _isOracle = string.Equals(provider, "Oracle", StringComparison.OrdinalIgnoreCase);
        }

        public async Task<IEnumerable<OperatingUnitModel>> ListOperatingUnitsAsync()
        {
            using var conn = _factory.CreateConnection();
            if (_isOracle)
            {
                var p = new OracleDynamicParameters();
                p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
                return await conn.Connection.QueryAsync<OperatingUnitModel>(
                    "JAN_PKG_JAN_ORG_UNIT.P_LIST_OPERATING_UNITS", p, commandType: CommandType.StoredProcedure);
            }
            else
            {
                const string sql = "SELECT 101 AS OperatingUnit, 'Operating Unit 1' AS OperatingUnitName UNION SELECT 102, 'Operating Unit 2'";
                return await conn.Connection.QueryAsync<OperatingUnitModel>(sql);
            }
        }

        public async Task<IEnumerable<OrganizationModel>> ListOrganizationsAsync(int operatingUnit)
        {
            using var conn = _factory.CreateConnection();
            if (_isOracle)
            {
                var p = new OracleDynamicParameters();
                p.Add("P_OPERATING_UNIT", operatingUnit, OracleMappingType.Int32, ParameterDirection.Input);
                p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
                return await conn.Connection.QueryAsync<OrganizationModel>(
                    "JAN_PKG_JAN_ORG_UNIT.P_LIST_ORGANIZATIONS_BY_OU", p, commandType: CommandType.StoredProcedure);
            }
            else
            {
                const string sql = "SELECT 103 AS OrganizationId, 'ORG1' AS OrganizationCode UNION SELECT 104, 'ORG2'";
                return await conn.Connection.QueryAsync<OrganizationModel>(sql);
            }
        }
    }
}
