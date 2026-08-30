import type { Schema } from "../utils/validate";
import type { ModuleModel, RoleModel, MenuModel, UserModel } from "../types/models";

export const moduleSchema: Schema<ModuleModel> = {
  moduleName: { required: true, maxLength: 100, message: "Module name is required (max 100 chars)" },
  defaultMenu: { maxLength: 100 },
  sortOrder: { 
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 999) return "Sort order must be between 1 and 999";
      return undefined;
    }
  }
};

export const roleSchema: Schema<RoleModel> = {
  roleName: { required: true, maxLength: 100, message: "Role name is required (max 100 chars)" },
  remarks: { maxLength: 400 }
};

export const menuSchema: Schema<MenuModel> = {
  displayName: { required: true, maxLength: 100, message: "Display name is required (max 100 chars)" },
  moduleId: { required: true, message: "Module is required" },
  sortOrder: { 
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 999) return "Sort order must be between 1 and 999";
      return undefined;
    }
  }
};

export const userCreateSchema: Schema<UserModel & { password?: string }> = {
  employeeId: { required: true, maxLength: 50, message: "Employee ID is required (max 50 chars)" },
  fullName: { required: true, maxLength: 150, message: "Full name is required (max 150 chars)" },
  userName: { required: true, maxLength: 50, message: "Username is required (max 50 chars)" },
  password: { required: true, minLength: 6, message: "Password is required (min 6 characters)" },
  userType: { required: true, message: "User type is required" },
  securityLevel: { 
    required: true,
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 9) return "Security level must be between 1 and 9";
      return undefined;
    }
  },
  roleId: { required: true, message: "Role is required" },
  primaryEmail: { 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format"
  }
};

export const userEditSchema: Schema<UserModel & { password?: string }> = {
  employeeId: { required: true, maxLength: 50, message: "Employee ID is required (max 50 chars)" },
  fullName: { required: true, maxLength: 150, message: "Full name is required (max 150 chars)" },
  userName: { required: true, maxLength: 50, message: "Username is required (max 50 chars)" },
  userType: { required: true, message: "User type is required" },
  securityLevel: { 
    required: true,
    custom: (val) => {
      const num = Number(val);
      if (isNaN(num) || num < 1 || num > 9) return "Security level must be between 1 and 9";
      return undefined;
    }
  },
  roleId: { required: true, message: "Role is required" },
  primaryEmail: { 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format"
  }
};
