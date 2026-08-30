import { useEffect, useState } from "react";
import { roleMenuApi, rolesApi } from "@/api/endpoints";
import type { ModuleAccessModel, RoleModel } from "@/types/models";

export default function RoleVsModulePage() {
  const [rows, setRows] = useState<ModuleAccessModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [activeRole, setActiveRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [access, roleList] = await Promise.all([roleMenuApi.listModuleAccess(), rolesApi.list()]);
    setRows(access);
    setRoles(roleList);
    if (!activeRole && roleList.length > 0) setActiveRole(roleList[0].roleName);
    setLoading(false);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filteredRows = rows.filter((r) => r.roleName === activeRole);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Role vs Module</h2>
        <p className="text-xs text-slate-500 mt-0.5">Module-level access, derived from menu permissions</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg mb-4 leading-relaxed">
        This screen is read-only. Module access follows automatically once a role has at least one menu permission within that module — edit permissions on Role vs Menu instead.
      </div>

      {!loading && (
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {roles.map((r) => (
            <button key={r.roleId} onClick={() => setActiveRole(r.roleName)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${activeRole === r.roleName ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"}`}>
              {r.roleName}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold">Module</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold">Role</th>
                <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold">Access</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-500">Loading…</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-500">No modules found for this role.</td></tr>
              ) : filteredRows.map((row) => (
                <tr key={row.moduleId} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{row.moduleName}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800 border border-purple-300">{row.roleName}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {row.accessFlag === "ALLOWED" ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300">Allowed</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-300">Denied</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
