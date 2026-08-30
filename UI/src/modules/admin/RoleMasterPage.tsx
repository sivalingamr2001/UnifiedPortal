import { useEffect, useState } from "react";
import { rolesApi } from "@/api/endpoints";
import type { RoleModel } from "@/types/models";
import { SecondaryButton, Modal, Field, fieldInputCls } from "@/components/ui";
import { ApiError } from "@/api/axiosClient";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { roleSchema } from "@/validation/schemas";
import { validate, type FieldErrors } from "@/utils/validate";

const SOURCE_STYLES: Record<string, string> = {
  FRAMEWORK: "bg-purple-100 text-purple-800 border-purple-300",
  ADMIN: "bg-blue-100 text-blue-800 border-blue-300",
  USER: "bg-slate-100 text-slate-700 border-slate-300",
  DEVADMIN: "bg-slate-100 text-slate-700 border-slate-300",
};

const emptyRole: Partial<RoleModel> = { sourceType: "USER", status: "ACTIVE" };

export default function RoleMasterPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<RoleModel>>(emptyRole);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setRoles(await rolesApi.list());
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  const filtered = roles.filter(
    (r) => r.roleName.toLowerCase().includes(search.toLowerCase()) || (r.roleCode ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditing(emptyRole);
    setFieldErrors({});
    setDialogOpen(true);
  }
  function openEdit(role: RoleModel) {
    setEditing({ ...role });
    setFieldErrors({});
    setDialogOpen(true);
  }

  async function handleSave() {
    const result = validate<Partial<RoleModel>>(roleSchema, editing);
    if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const apiResult = editing.roleId
        ? await rolesApi.update(editing.roleId, result.data)
        : await rolesApi.create(result.data);
      if (!apiResult.success) { showToast(apiResult.message, "error"); return; }
      showToast(apiResult.generatedCode ? `${apiResult.message} Code: ${apiResult.generatedCode}` : apiResult.message, "success");
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(roleId: number) {
    const ok = await confirm({ title: "Delete role", message: "Delete this role? Blocked if any user is still assigned to it.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    const result = await rolesApi.remove(roleId);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Role Master</h2>
          <span className="text-[10px] font-mono text-slate-600 font-semibold border border-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">{roles.length} records</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="bg-white border border-slate-300 rounded pl-3 pr-3 py-1.5 text-[11px] text-slate-800 placeholder:text-slate-400 font-medium w-48 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-[11px] px-3 py-1.5 rounded transition-colors font-semibold shadow-sm cursor-pointer">
            + New
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">#</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Code</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Role Name</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Source Type</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Remarks</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Version</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Status</th>
                <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-slate-600 font-bold whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">No records found.</td></tr>
              ) : filtered.map((r, i) => {
                const source = r.sourceType ?? "USER";
                const style = SOURCE_STYLES[source] ?? SOURCE_STYLES.USER;
                return (
                  <tr key={r.roleId} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors duration-100 group">
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700">{i + 1}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px]"><span className="text-blue-700 font-bold">{r.roleCode ?? "—"}</span></td>
                    <td className="px-3 py-2.5"><span className="text-slate-900 font-semibold">{r.roleName}</span></td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${style}`}>
                        {source.charAt(0) + source.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><span className="text-slate-600 text-[11px] font-medium">{r.remarks ?? "—"}</span></td>
                    <td className="px-3 py-2.5 font-mono text-[11px]"><span className="text-slate-600 font-semibold">{r.roleVersion ?? 1}</span></td>
                    <td className="px-3 py-2.5">
                      {r.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300">Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-300">Inactive</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition-colors text-[10px] font-bold cursor-pointer mr-1.5">Edit</button>
                        <button onClick={() => handleDelete(r.roleId)} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors text-[10px] font-bold cursor-pointer">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dialogOpen && (
        <Modal title={editing.roleId ? "Edit Role" : "New Role"} onClose={() => setDialogOpen(false)}
          footer={<><SecondaryButton onClick={() => setDialogOpen(false)}>Cancel</SecondaryButton>
            <button onClick={handleSave} disabled={saving} className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
              {saving ? "Saving…" : "Save"}
            </button></>}>
          {editing.roleId ? (
            <Field label="Role Code"><input className={fieldInputCls()} disabled value={editing.roleCode ?? ""} /></Field>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3">Role code is auto-generated (e.g. ROL008) — not editable.</div>
          )}
          <Field label="Role Name" required error={fieldErrors.roleName}>
            <input className={fieldInputCls(fieldErrors.roleName)} maxLength={100} value={editing.roleName ?? ""} onChange={(e) => setEditing({ ...editing, roleName: e.target.value })} />
          </Field>
          <Field label="Source Type" error={fieldErrors.sourceType}>
            <select className={fieldInputCls(fieldErrors.sourceType)} value={editing.sourceType ?? "USER"} onChange={(e) => setEditing({ ...editing, sourceType: e.target.value as RoleModel["sourceType"] })}>
              <option value="FRAMEWORK">Framework</option><option value="ADMIN">Admin</option><option value="USER">User</option><option value="DEVADMIN">Devadmin</option>
            </select>
          </Field>
          <Field label="Remarks" error={fieldErrors.remarks}>
            <textarea className={fieldInputCls(fieldErrors.remarks)} maxLength={400} rows={2} value={editing.remarks ?? ""} onChange={(e) => setEditing({ ...editing, remarks: e.target.value })} />
          </Field>
          <Field label="Status" error={fieldErrors.status}>
            <select className={fieldInputCls(fieldErrors.status)} value={editing.status ?? "ACTIVE"} onChange={(e) => setEditing({ ...editing, status: e.target.value as RoleModel["status"] })}>
              <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}
