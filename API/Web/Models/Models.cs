using System;
using System.Collections.Generic;

namespace JanaticsAdminPortal.API.Models
{
    public class RoleModel
    {
        public int RoleId { get; set; }
        public string? RoleCode { get; set; }
        public string RoleName { get; set; } = "";
        public string SourceType { get; set; } = "USER";
        public string? Remarks { get; set; }
        public string RoleVersion { get; set; } = "V1";
        public string Status { get; set; } = "ACTIVE";
    }

    public class ModuleModel
    {
        public int ModuleId { get; set; }
        public string? ModuleCode { get; set; }
        public string ModuleName { get; set; } = "";
        public string? DefaultMenu { get; set; }
        public int SortOrder { get; set; } = 1;
        public string? Remarks { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }

    public class MenuModel
    {
        public int MenuId { get; set; }
        public string? MenuCode { get; set; }
        public string MenuName { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public int ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public int? ParentMenuId { get; set; }
        public string MenuType { get; set; } = "MASTER";
        public string Nature { get; set; } = "FORM";
        public int SortOrder { get; set; } = 1;
        public string Status { get; set; } = "ACTIVE";
    }

    public class UserModel
    {
        public int UserId { get; set; }
        public string? UserCode { get; set; }
        public string EmployeeId { get; set; } = "";
        public string FullName { get; set; } = "";
        public string UserName { get; set; } = "";
        public string? Password { get; set; }
        public string UserType { get; set; } = "EMPLOYEE";
        public int SecurityLevel { get; set; } = 10;
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int? ReportingTo { get; set; }
        public string? ReportsToName { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime? ValidTo { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public string? PrimaryEmail { get; set; }
        public string? PrimaryMobile { get; set; }
        public string PasswordPolicy { get; set; } = "STANDARD";
        public int? WorkOperatingUnit { get; set; }
        public string Theme { get; set; } = "DEFAULT_BLUE";
        public string Timezone { get; set; } = "Asia/Kolkata";
        public int MaxSessions { get; set; } = 1;
        public string LoginWorkdaysOnly { get; set; } = "Y";
        public string LoginFromTime { get; set; } = "00:00";
        public string LoginToTime { get; set; } = "23:59";
        public string? AllowedMachines { get; set; }
        public string? AllowedIps { get; set; }
    }

    public class RoleMenuModel
    {
        public int RoleMenuId { get; set; }
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int ModuleId { get; set; }
        public string? ModuleName { get; set; }
        public int MenuId { get; set; }
        public string? MenuName { get; set; }
        public string PermView { get; set; } = "N";
        public string PermAdd { get; set; } = "N";
        public string PermEdit { get; set; } = "N";
        public string PermDelete { get; set; } = "N";
        public string PermExport { get; set; } = "N";
        public string PermApprove { get; set; } = "N";
        public string? RestrictedColumns { get; set; }
    }

    public class ModuleAccessModel
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = "";
        public int ModuleId { get; set; }
        public string ModuleName { get; set; } = "";
        public string AccessFlag { get; set; } = "DENIED";
    }

    public class OperatingUnitModel
    {
        public int OperatingUnit { get; set; }
        public string OperatingUnitName { get; set; } = "";
    }

    public class OrganizationModel
    {
        public int OrganizationId { get; set; }
        public string OrganizationCode { get; set; } = "";
    }

    public class OrgUnitLine
    {
        public int UarId { get; set; }
        public int OperatingUnit { get; set; }
        public string? OperatingUnitName { get; set; }
        public int OrganizationId { get; set; }
        public string? OrganizationCode { get; set; }
        public decimal LimitValue { get; set; }
    }

    public class UserAccessRightsModel
    {
        public int UarId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string AccessChannel { get; set; } = "SYSTEM";
        public string Status { get; set; } = "ACTIVE";
        public string? Remarks { get; set; }
        public int OrgUnitsSelected { get; set; }
        public int TotalOrgUnits { get; set; }
        public List<OrgUnitLine> OrgUnits { get; set; } = new();
    }

    public class ProcedureResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public int? NewId { get; set; }
        public string? GeneratedCode { get; set; }
    }

    public class UserLoginRequest
    {
        public string UserName { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginResponse
    {
        public string Token { get; set; } = "";
        public DateTime ExpiresAtUtc { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string NewPassword { get; set; } = "";
    }
}
