import { useEffect, useMemo, useState } from "react";
import { menusApi, modulesApi } from "@/api/endpoints";
import type { MenuModel, ModuleModel } from "@/types/models";
import { Card, SectionHeading, PrimaryButton, SecondaryButton, Modal, Field, fieldInputCls, Code, IconAction, LoadingRow, EmptyRow } from "@/components/ui";
import { ApiError } from "@/api/axiosClient";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { menuSchema } from "@/validation/schemas";
import { validate, type FieldErrors } from "@/utils/validate";

// Sorts menus into parent-then-children order, and returns each menu's
// tree depth (0 = top-level) so the table can indent children visually -
// otherwise a flat list gives no sense of the hierarchy at all.
function sortIntoTree(menus: MenuModel[]): { menu: MenuModel; depth: number }[] {
  const byParent = new Map<number | null, MenuModel[]>();
  menus.forEach((m) => {
    const key = m.parentMenuId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(m);
  });
  byParent.forEach((list) => list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));

  const result: { menu: MenuModel; depth: number }[] = [];
  function walk(parentId: number | null, depth: number) {
    for (const m of byParent.get(parentId) ?? []) {
      result.push({ menu: m, depth });
      walk(m.menuId ?? m.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

export default function MenuMasterPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [menus, setMenus] = useState<MenuModel[]>([]);
  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<MenuModel>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setMenus(await menusApi.list());
    setLoading(false);
  }
  useEffect(() => { void load(); void modulesApi.list().then(setModules); }, []);

  const tree = useMemo(() => sortIntoTree(menus), [menus]);

  // Only menus in the SAME module can be a parent - a sub-menu belonging
  // to a different module than its parent wouldn't make structural sense,
  // and would break the module-derived-access logic downstream.
  const parentCandidates = useMemo(
    () => menus.filter((m) => m.moduleId === editing.moduleId && m.menuId !== editing.menuId),
    [menus, editing.moduleId, editing.menuId],
  );

  function openCreate() {
    setEditing({ status: "ACTIVE", menuType: "MASTER", nature: "FORM", sortOrder: 1, moduleId: modules[0]?.moduleId, parentMenuId: null });
    setFieldErrors({});
    setDialogOpen(true);
  }

  async function handleSave() {
    const result = validate<Partial<MenuModel>>(menuSchema, editing);
    if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const apiResult = editing.menuId ? await menusApi.update(editing.menuId, result.data) : await menusApi.create(result.data);
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

  async function handleDelete(menuId: number) {
    const ok = await confirm({ title: "Delete menu", message: "Delete this menu? Blocked if any sub-menu still belongs to it.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    const result = await menusApi.remove(menuId);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) await load();
  }

  return (
    <div>
      <SectionHeading title="Menu Master" subtitle={`${menus.length} records`} action={<PrimaryButton onClick={openCreate}>+ New</PrimaryButton>} />

      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-lg mb-4">
        To build a sub-menu: create the parent menu first (leave "Parent Menu" as "— None (top-level) —"), then create the child and select that parent. A menu can only have a parent from the same module.
      </div>

      <Card className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 text-left border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Code</th><th className="px-4 py-3 font-semibold">Menu Name</th>
              <th className="px-4 py-3 font-semibold">Module</th><th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRow colSpan={5} /> : tree.length === 0 ? <EmptyRow colSpan={5} /> : tree.map(({ menu: m, depth }) => (
              <tr key={m.menuId} className="border-t border-slate-100 hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3"><Code>{m.menuCode}</Code></td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  <span style={{ paddingLeft: depth * 20 }} className="inline-flex items-center gap-1.5">
                    {depth > 0 && <span className="text-slate-400 text-xs">↳</span>}
                    {m.displayName}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{m.moduleName}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">{m.menuType}</span></td>
                <td className="px-4 py-3 text-right">
                  <IconAction label="Edit" onClick={() => { setEditing({ ...m }); setFieldErrors({}); setDialogOpen(true); }} />
                  <IconAction label="Delete" danger onClick={() => handleDelete(m.menuId!)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {dialogOpen && (
        <Modal title={editing.menuId ? "Edit Menu" : "New Menu"} onClose={() => setDialogOpen(false)}
          footer={<><SecondaryButton onClick={() => setDialogOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton></>}>
          {editing.menuId ? (
            <Field label="Menu Code"><input className={fieldInputCls()} disabled value={editing.menuCode ?? ""} /></Field>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Menu code is auto-generated (e.g. MNU009) — not editable.</div>
          )}
          <Field label="Display Name" required error={fieldErrors.displayName}>
            <input className={fieldInputCls(fieldErrors.displayName)} maxLength={100} value={editing.displayName ?? ""} onChange={(e) => setEditing({ ...editing, displayName: e.target.value })} />
          </Field>
          <Field label="Module" required error={fieldErrors.moduleId}>
            <select className={fieldInputCls(fieldErrors.moduleId)} value={editing.moduleId ?? ""}
              onChange={(e) => setEditing({ ...editing, moduleId: Number(e.target.value), parentMenuId: null })}>
              {modules.map((mod) => <option key={mod.moduleId} value={mod.moduleId}>{mod.moduleName}</option>)}
            </select>
          </Field>
          <Field label="Parent Menu" hint="Only menus within the same module can be selected. Leave as None for a top-level menu.">
            <select className={fieldInputCls()} value={editing.parentMenuId ?? ""}
              onChange={(e) => setEditing({ ...editing, parentMenuId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— None (top-level) —</option>
              {parentCandidates.map((m) => <option key={m.menuId} value={m.menuId}>{m.displayName}</option>)}
            </select>
          </Field>
          <Field label="Type" error={fieldErrors.menuType}>
            <select className={fieldInputCls(fieldErrors.menuType)} value={editing.menuType ?? "MASTER"} onChange={(e) => setEditing({ ...editing, menuType: e.target.value as MenuModel["menuType"] })}>
              <option value="MASTER">Master</option><option value="TRANSACTION">Transaction</option><option value="REPORT">Report</option>
            </select>
          </Field>
          <Field label="Nature" error={fieldErrors.nature}>
            <select className={fieldInputCls(fieldErrors.nature)} value={editing.nature ?? "FORM"} onChange={(e) => setEditing({ ...editing, nature: e.target.value as MenuModel["nature"] })}>
              <option value="FORM">Form</option><option value="REPORT">Report</option>
            </select>
          </Field>
          <Field label="Sort Order" error={fieldErrors.sortOrder}>
            <input type="number" min={1} max={999} className={fieldInputCls(fieldErrors.sortOrder)} value={editing.sortOrder ?? 1} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
          </Field>
          <Field label="Status" error={fieldErrors.status}>
            <select className={fieldInputCls(fieldErrors.status)} value={editing.status ?? "ACTIVE"} onChange={(e) => setEditing({ ...editing, status: e.target.value as MenuModel["status"] })}>
              <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}
