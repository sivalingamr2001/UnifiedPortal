using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Dapper.Oracle;
using DynamicTransaction.Interfaces;
using JanaticsAdminPortal.API.Data;
using JanaticsAdminPortal.API.Models;

namespace JanaticsAdminPortal.API.Repositories
{
    public class LoginCredentialsRow
    {
        public int UserId { get; set; }
        public string UserCode { get; set; } = "";
        public string UserName { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string PasswordSalt { get; set; } = "";
        public string Status { get; set; } = "";
        public int MaxSessions { get; set; }
        public string LoginWorkdaysOnly { get; set; } = "Y";
        public string LoginFromTime { get; set; } = "00:00";
        public string LoginToTime { get; set; } = "23:59";
        public string? AllowedIps { get; set; }
        public string? AllowedMachines { get; set; }
        public int RoleId { get; set; }
    }

    public class EmployeeVerificationResult
    {
        public bool Found { get; set; }
        public string? EmployeeName { get; set; }
    }

    internal class MasEmployeeRow
    {
        public string? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? Status { get; set; }
    }

    public class UserRepository
    {
        private readonly IDbConnectionFactory _factory;
        public UserRepository(IDbConnectionFactory factory) => _factory = factory;

        public async Task<EmployeeVerificationResult> VerifyEmployeeAsync(string employeeId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_EMPLOYEE_ID", employeeId, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            var rows = await conn.Connection.QueryAsync<MasEmployeeRow>(
                "JAN_PKG_JAN_MAS_EMPLOYEE.P_GET_EMPLOYEE_DETAILS", p, commandType: CommandType.StoredProcedure);
            var match = rows.FirstOrDefault();
            if (match == null)
                return new EmployeeVerificationResult { Found = false };
            return new EmployeeVerificationResult { Found = true, EmployeeName = match.EmployeeName };
        }

        public async Task<IEnumerable<UserModel>> ListAsync(int requestingUserId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_REQUESTING_USER_ID", requestingUserId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            var rows = await conn.Connection.QueryAsync<UserModel>("JAN_PKG_JAN_USER_MASTER.P_LIST_USERS", p, commandType: CommandType.StoredProcedure);
            foreach (var u in rows) u.Password = null;
            return rows;
        }

        public async Task<UserModel?> GetAsync(int userId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            var rows = await conn.Connection.QueryAsync<UserModel>("JAN_PKG_JAN_USER_MASTER.P_GET_USER", p, commandType: CommandType.StoredProcedure);
            var user = rows.FirstOrDefault();
            if (user != null) user.Password = null;
            return user;
        }

        public async Task<LoginCredentialsRow?> GetLoginCredentialsAsync(string userName)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_USER_NAME", userName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_CURSOR", dbType: OracleMappingType.RefCursor, direction: ParameterDirection.Output);
            var rows = await conn.Connection.QueryAsync<LoginCredentialsRow>("JAN_PKG_JAN_USER_MASTER.P_GET_LOGIN_CREDENTIALS", p, commandType: CommandType.StoredProcedure);
            return rows.FirstOrDefault();
        }

        public async Task<ProcedureResult> CreateAsync(UserModel u, string createdBy)
        {
            if (string.IsNullOrWhiteSpace(u.Password))
                return new ProcedureResult { Success = false, Message = "Password is required." };
            if (string.IsNullOrWhiteSpace(u.EmployeeId))
                return new ProcedureResult { Success = false, Message = "Employee ID is required." };

            var (hash, salt) = PasswordHasher.Hash(u.Password);

            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_USER_CODE", null, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_EMPLOYEE_ID", u.EmployeeId, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_FULL_NAME", u.FullName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PASSWORD_HASH", hash, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PASSWORD_SALT", salt, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_USER_TYPE", u.UserType, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_SECURITY_LEVEL", u.SecurityLevel, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_ROLE_ID", u.RoleId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_REPORTING_TO", u.ReportingTo, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_VALID_FROM", u.ValidFrom, OracleMappingType.Date, ParameterDirection.Input);
            p.Add("P_VALID_TO", u.ValidTo, OracleMappingType.Date, ParameterDirection.Input);
            p.Add("P_STATUS", u.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PRIMARY_EMAIL", u.PrimaryEmail, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PRIMARY_MOBILE", u.PrimaryMobile, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PASSWORD_POLICY", u.PasswordPolicy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_WORK_OPERATING_UNIT", u.WorkOperatingUnit, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_THEME", u.Theme, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_TIMEZONE", u.Timezone, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_MAX_SESSIONS", u.MaxSessions, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_LOGIN_WORKDAYS_ONLY", u.LoginWorkdaysOnly, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_LOGIN_FROM_TIME", u.LoginFromTime, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_LOGIN_TO_TIME", u.LoginToTime, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_ALLOWED_MACHINES", u.AllowedMachines, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_ALLOWED_IPS", u.AllowedIps, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_CREATED_BY", createdBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_NEW_USER_ID", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_USER_MASTER.P_INSERT_USER", p, commandType: CommandType.StoredProcedure);
            var success = p.Get<int>("P_RESULT_CODE") == 1;
            var newId = p.Get<int?>("P_NEW_USER_ID");
            return new ProcedureResult
            {
                Success = success, Message = p.Get<string>("P_RESULT_MSG"), NewId = newId,
                GeneratedCode = (success && newId.HasValue) ? $"USR{newId.Value:D3}" : null,
            };
        }

        public async Task<ProcedureResult> UpdateAsync(int userId, UserModel u, string modifiedBy, int requestingUserId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_REQUESTING_USER_ID", requestingUserId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_FULL_NAME", u.FullName, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_USER_TYPE", u.UserType, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_SECURITY_LEVEL", u.SecurityLevel, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_ROLE_ID", u.RoleId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_REPORTING_TO", u.ReportingTo, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_VALID_FROM", u.ValidFrom, OracleMappingType.Date, ParameterDirection.Input);
            p.Add("P_VALID_TO", u.ValidTo, OracleMappingType.Date, ParameterDirection.Input);
            p.Add("P_STATUS", u.Status, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PRIMARY_EMAIL", u.PrimaryEmail, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PRIMARY_MOBILE", u.PrimaryMobile, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PASSWORD_POLICY", u.PasswordPolicy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_WORK_OPERATING_UNIT", u.WorkOperatingUnit, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_THEME", u.Theme, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_TIMEZONE", u.Timezone, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_MAX_SESSIONS", u.MaxSessions, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_LOGIN_WORKDAYS_ONLY", u.LoginWorkdaysOnly, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_LOGIN_FROM_TIME", u.LoginFromTime, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_LOGIN_TO_TIME", u.LoginToTime, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_ALLOWED_MACHINES", u.AllowedMachines, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_ALLOWED_IPS", u.AllowedIps, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_MODIFIED_BY", modifiedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_USER_MASTER.P_UPDATE_USER", p, commandType: CommandType.StoredProcedure);
            return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
        }

        public async Task<ProcedureResult> ChangePasswordAsync(int userId, string newPassword, string modifiedBy)
        {
            var (hash, salt) = PasswordHasher.Hash(newPassword);
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_PASSWORD_HASH", hash, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_PASSWORD_SALT", salt, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_MODIFIED_BY", modifiedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_USER_MASTER.P_UPDATE_PASSWORD", p, commandType: CommandType.StoredProcedure);
            return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
        }

        public async Task<ProcedureResult> DeleteAsync(int userId, string deletedBy, int requestingUserId)
        {
            using var conn = _factory.CreateConnection();
            var p = new OracleDynamicParameters();
            p.Add("P_REQUESTING_USER_ID", requestingUserId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_USER_ID", userId, OracleMappingType.Int32, ParameterDirection.Input);
            p.Add("P_DELETED_BY", deletedBy, OracleMappingType.Varchar2, ParameterDirection.Input);
            p.Add("P_RESULT_CODE", dbType: OracleMappingType.Int32, direction: ParameterDirection.Output);
            p.Add("P_RESULT_MSG", dbType: OracleMappingType.Varchar2, direction: ParameterDirection.Output, size: 400);
            await conn.Connection.ExecuteAsync("JAN_PKG_JAN_USER_MASTER.P_DELETE_USER", p, commandType: CommandType.StoredProcedure);
            return new ProcedureResult { Success = p.Get<int>("P_RESULT_CODE") == 1, Message = p.Get<string>("P_RESULT_MSG") };
        }
    }
}
