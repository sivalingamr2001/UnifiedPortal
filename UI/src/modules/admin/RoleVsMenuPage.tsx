import { useEffect, useMemo, useState } from "react";
import { roleMenuApi, rolesApi, menusApi } from "@/api/endpoints";
import type { RoleMenuModel, RoleModel, MenuModel } from "@/types/models";
import { useToast } from "@/components/Toast";

const PERM_KEYS = [
  { key: "permView", label: "VIEW" }, { key: "permAdd", label: "ADD" }, { key: "permEdit", label: "EDIT" },
  { key: "permDelete", label: "DELETE" }, { key: "permExport", label: "EXPORT" }, { key: "permApprove", label: "APPROVE" },
] as const;
type PermKey = (typeof PERM_KEYS)[number]["key"];

const TYPE_LABELS: Record<string, string> = { MASTER: "Masters", TRANSACTION: "Transactions", REPORT: "Reports" };
const TYPE_ORDER = ["MASTER", "TRANSACTION", "REPORT"] as const;

type DraftPerms = Record<PermKey, "Y" | "N">;
const emptyPerms: DraftPerms = { permView: "N", permAdd: "N", permEdit: "N", permDelete: "N", permExport: "N", permApprove: "N" };

export default function RoleVsMenuPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<RoleMenuModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [allMenus, setAllMenus] = useState<MenuModel[]>([]);
  const [activeRole, setActiveRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [columnDrafts, setColumnDrafts] = useState<Record<number, string>>({});

  // Assignment modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignRoleId, setAssignRoleId] = useState<number | "">("");
  const [drafts, setDrafts] = useState<Record<number, DraftPerms>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [mappings, roleList, menuList] = await Promise.all([roleMenuApi.list(), rolesApi.list(), menusApi.list()]);
    setRows(mappings);
    setRoles(roleList);
    setAllMenus(menuList);
    if (!activeRole && roleList.length > 0) setActiveRole(roleList[0].roleName);
    setLoading(false);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function togglePerm(row: RoleMenuModel, key: PermKey) {
    const next: RoleMenuModel = { ...row, [key]: row[key] === "Y" ? "N" : "Y" };
    const result = await roleMenuApi.save(next);
    if (result.success) await load(); else showToast(result.message, "error");
  }

  async function saveRestrictedColumns(row: RoleMenuModel) {
    if (row.roleMenuId === undefined) return;
    const draft = columnDrafts[row.roleMenuId];
    if (draft === undefined) return;
    const normalized = draft.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean).join(",");
    const result = await roleMenuApi.save({ ...row, restrictedColumns: normalized || null });
    showToast(result.success ? (normalized ? `Restricted columns updated: ${normalized}` : "Restricted columns cleared.") : result.message, result.success ? "success" : "error");
    if (result.success) await load();
    setColumnDrafts((prev) => { const next = { ...prev }; if (row.roleMenuId !== undefined) delete next[row.roleMenuId]; return next; });
  }

  const filteredRows = rows.filter((r) => r.roleName === activeRole);

  // ---- Assignment modal logic ----
  function openAssign() {
    setAssignRoleId(roles[0]?.roleId ?? "");
    setDrafts({});
    setDialogOpen(true);
  }

  useEffect(() => {
    if (!dialogOpen || assignRoleId === "") return;
    const existingForRole = rows.filter((r) => r.roleId === assignRoleId);
    const next: Record<number, DraftPerms> = {};
    allMenus.forEach((m) => {
      const existing = existingForRole.find((r) => r.menuId === m.id);
      next[m.id] = existing
        ? {
            permView: (existing.permView ?? "N") as any,
            permAdd: (existing.permAdd ?? "N") as any,
            permEdit: (existing.permEdit ?? "N") as any,
            permDelete: (existing.permDelete ?? "N") as any,
            permExport: (existing.permExport ?? "N") as any,
            permApprove: (existing.permApprove ?? "N") as any,
          }
        : { ...emptyPerms };
    });
    setDrafts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, assignRoleId]);

  const menusByType = useMemo(() => {
    const groups: Record<string, MenuModel[]> = {};
    allMenus.forEach((m) => {
      if (m.menuType) {
        (groups[m.menuType] ??= []).push(m);
      }
    });
    return groups;
  }, [allMenus]);

  const mappedCount = Object.values(drafts).filter((d) => PERM_KEYS.some((p) => d[p.key] === "Y")).length;

  function toggleDraftPerm(menuId: number, key: PermKey) {
    setDrafts((prev) => ({ ...prev, [menuId]: { ...prev[menuId], [key]: prev[menuId][key] === "Y" ? "N" : "Y" } }));
  }
  function toggleAllForMenu(menuId: number) {
    const current = drafts[menuId];
    if (!current) return;
    const allOn = PERM_KEYS.every((p) => current[p.key] === "Y");
    const next: DraftPerms = allOn ? { ...emptyPerms } : { permView: "Y", permAdd: "Y", permEdit: "Y", permDelete: "Y", permExport: "Y", permApprove: "Y" };
    setDrafts((prev) => ({ ...prev, [menuId]: next }));
  }
  function selectAllMenus() {
    const next: Record<number, DraftPerms> = {};
    allMenus.forEach((m) => { next[m.id] = { permView: "Y", permAdd: "Y", permEdit: "Y", permDelete: "Y", permExport: "Y", permApprove: "Y" }; });
    setDrafts(next);
  }
  function clearAllMenus() {
    const next: Record<number, DraftPerms> = {};
    allMenus.forEach((m) => { next[m.id] = { ...emptyPerms }; });
    setDrafts(next);
  }

  async function handleSaveAssignment() {
    if (assignRoleId === "") return;
    setSaving(true);
    try {
      let failCount = 0;
      for (const menu of allMenus) {
        const draft = drafts[menu.id];
        if (!draft) continue;
        const hasAny = PERM_KEYS.some((p) => draft[p.key] === "Y");
        const existing = rows.find((r) => r.roleId === assignRoleId && r.menuId === menu.id);
        if (!hasAny && !existing) continue; // nothing to do - never had permissions, still none
        const result = await roleMenuApi.save({
          roleMenuId: existing?.roleMenuId ?? 0, roleId: assignRoleId as number, roleName: null,
          moduleId: menu.moduleId ?? 0, moduleName: null, menuId: menu.id, menuName: null,
          ...draft, restrictedColumns: existing?.restrictedColumns ?? null,
        });
        if (!result.success) failCount++;
      }
      showToast(failCount > 0 ? `Saved with ${failCount} error(s).` : "Permissions saved successfully.", failCount > 0 ? "error" : "success");
      setDialogOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Role vs Menu</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fine-grained permissions plus per-column restrictions</p>
        </div>
        <button onClick={openAssign} className="bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer">
          + New
        </button>
      </div>

      {!loading && (
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {roles.map((r) => (
            <button key={r.roleId} onClick={() => setActiveRole(r.roleName)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${activeRole === r.roleName ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"}`}>
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
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Menu</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Role</th>
                {PERM_KEYS.map((p) => <th key={p.key} className="px-2 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold">{p.label}</th>)}
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold min-w-[180px]">Restricted Columns</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-500">Loading…</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-500">No permissions for this role yet. Click "+ New" to assign some.</td></tr>
              ) : filteredRows.map((row) => (
                <tr key={row.roleMenuId} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{row.menuName}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800 border border-purple-300">{row.roleName}</span>
                  </td>
                  {PERM_KEYS.map((p) => (
                    <td key={p.key} className="px-2 py-2.5 text-center">
                      <button onClick={() => togglePerm(row, p.key)} className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${row[p.key] === "Y" ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300" : "bg-slate-100 text-slate-400"}`}>
                        {row[p.key] === "Y" ? "Y" : "N"}
                      </button>
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <input value={(row.roleMenuId !== undefined ? columnDrafts[row.roleMenuId] : undefined) ?? row.restrictedColumns ?? ""} onChange={(e) => setColumnDrafts((prev) => ({ ...prev, [row.roleMenuId!]: e.target.value }))}
                      onBlur={() => saveRestrictedColumns(row)} placeholder="e.g. RATE,PRICE" maxLength={1000}
                      className="w-full px-2 py-1 text-[11px] font-mono rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex justify-end z-50" role="dialog" aria-modal="true">
          <div className="bg-white h-full w-[600px] shadow-2xl flex flex-col">
            <div className="bg-blue-700 text-white px-6 py-5 flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-[17px] font-bold">New Role vs Menu Mapping</h2>
                <p className="text-xs text-white/70 mt-1">Assign menu-level permissions to a role</p>
              </div>
              <button onClick={() => setDialogOpen(false)} className="text-white/70 hover:text-white text-lg leading-none cursor-pointer" aria-label="Close">✕</button>
            </div>

            <div className="px-6 py-4 border-b border-slate-200 shrink-0">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
              <select value={assignRoleId} onChange={(e) => setAssignRoleId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
                {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
              </select>
            </div>

            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-slate-600">{mappedCount} mapped</span>
              <div className="flex gap-3">
                <button onClick={selectAllMenus} className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer">Select All</button>
                <button onClick={clearAllMenus} className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer">Clear</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {TYPE_ORDER.filter((t) => menusByType[t]?.length).map((type) => (
                <div key={type} className="mb-5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">{TYPE_LABELS[type]}</div>
                  <div className="space-y-1.5">
                    {(menusByType[type] || []).map((menu: MenuModel) => {
                      const draft = drafts[menu.id];
                      if (!draft) return null;
                      const allOn = PERM_KEYS.every((p) => draft[p.key] === "Y");
                      return (
                        <div key={menu.id} className="flex items-center justify-between py-1">
                          <span className="text-sm text-slate-800">{menu.displayName}</span>
                          <div className="flex items-center gap-1">
                            {PERM_KEYS.slice(0, 4).map((p) => (
                              <button key={p.key} onClick={() => toggleDraftPerm(menu.id, p.key)}
                                className={`px-2 py-1 text-[10px] font-mono font-bold rounded border transition-colors cursor-pointer ${draft[p.key] === "Y" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-300"}`}>
                                {p.label.slice(0, 3)}
                              </button>
                            ))}
                            <button onClick={() => toggleAllForMenu(menu.id)}
                              className={`px-2 py-1 text-[10px] font-mono font-bold rounded border transition-colors cursor-pointer ${allOn ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-300"}`}>
                                ALL
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 text-sm font-medium rounded border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button onClick={handleSaveAssignment} disabled={saving || assignRoleId === ""} className="px-4 py-2 text-sm font-semibold rounded bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white cursor-pointer">
                {saving ? "Saving…" : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
