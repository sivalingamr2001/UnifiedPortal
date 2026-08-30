import { useEffect, useState } from "react";
import { modulesApi } from "@/api/endpoints";
import type { ModuleModel } from "@/types/models";
import { Card, SectionHeading, PrimaryButton, SecondaryButton, Modal, Field, fieldInputCls, StatusPill, Code, IconAction, LoadingRow, EmptyRow } from "@/components/ui";
import { ApiError } from "@/api/axiosClient";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { moduleSchema } from "@/validation/schemas";
import { validate, type FieldErrors } from "@/utils/validate";

const emptyModule: Partial<ModuleModel> = { status: "ACTIVE", sortOrder: 1 };

export default function ModuleMasterPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ModuleModel>>(emptyModule);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setModules(await modulesApi.list());
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function handleSave() {
    const result = validate<Partial<ModuleModel>>(moduleSchema, editing);
    if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const apiResult = editing.moduleId ? await modulesApi.update(editing.moduleId, result.data) : await modulesApi.create(result.data);
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

  async function handleDelete(moduleId: number) {
    const ok = await confirm({ title: "Delete module", message: "Delete this module? Blocked if any menu still belongs to it.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    const result = await modulesApi.remove(moduleId);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) await load();
  }

  return (
    <div>
      <SectionHeading title="Module Master" subtitle={`${modules.length} records`}
        action={<PrimaryButton onClick={() => { setEditing(emptyModule); setFieldErrors({}); setDialogOpen(true); }}>+ New</PrimaryButton>} />
      <Card className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 text-left border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Code</th><th className="px-4 py-3 font-semibold">Module Name</th>
              <th className="px-4 py-3 font-semibold">Sort</th><th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRow colSpan={5} /> : modules.length === 0 ? <EmptyRow colSpan={5} /> : modules.map((m) => (
              <tr key={m.moduleId} className="border-t border-slate-100 hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3"><Code>{m.moduleCode}</Code></td>
                <td className="px-4 py-3 font-medium text-slate-800">{m.moduleName}</td>
                <td className="px-4 py-3 text-slate-500">{m.sortOrder}</td>
                <td className="px-4 py-3"><StatusPill status={m.status} /></td>
                <td className="px-4 py-3 text-right">
                  <IconAction label="Edit" onClick={() => { setEditing({ ...m }); setFieldErrors({}); setDialogOpen(true); }} />
                  <IconAction label="Delete" danger onClick={() => handleDelete(m.moduleId!)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {dialogOpen && (
        <Modal title={editing.moduleId ? "Edit Module" : "New Module"} onClose={() => setDialogOpen(false)}
          footer={<><SecondaryButton onClick={() => setDialogOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton></>}>
          {editing.moduleId ? (
            <Field label="Module Code"><input className={fieldInputCls()} disabled value={editing.moduleCode ?? ""} /></Field>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Module code is auto-generated (e.g. MOD006) — not editable.</div>
          )}
          <Field label="Module Name" required error={fieldErrors.moduleName}>
            <input className={fieldInputCls(fieldErrors.moduleName)} maxLength={100} value={editing.moduleName ?? ""} onChange={(e) => setEditing({ ...editing, moduleName: e.target.value })} />
          </Field>
          <Field label="Default Menu" error={fieldErrors.defaultMenu}>
            <input className={fieldInputCls(fieldErrors.defaultMenu)} maxLength={100} value={editing.defaultMenu ?? ""} onChange={(e) => setEditing({ ...editing, defaultMenu: e.target.value })} />
          </Field>
          <Field label="Sort Order" error={fieldErrors.sortOrder}>
            <input type="number" min={1} max={999} className={fieldInputCls(fieldErrors.sortOrder)} value={editing.sortOrder ?? 1} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
          </Field>
          <Field label="Status" error={fieldErrors.status}>
            <select className={fieldInputCls(fieldErrors.status)} value={editing.status ?? "ACTIVE"} onChange={(e) => setEditing({ ...editing, status: e.target.value as ModuleModel["status"] })}>
              <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}
