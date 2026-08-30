import { useEffect, useState, useDeferredValue, useMemo, useRef } from "react";
import { usersApi, rolesApi } from "@/api/endpoints";
import type { UserModel, RoleModel } from "@/types/models";
import { Card, SectionHeading, PrimaryButton, SecondaryButton, Modal, Field, fieldInputCls, inputCls, RoleBadge, StatusPill, Code, IconAction, LoadingRow, EmptyRow } from "@/components/ui";
import { ApiError } from "@/api/axiosClient";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { userCreateSchema, userEditSchema } from "@/validation/schemas";
import { validate, type FieldErrors } from "@/utils/validate";

export default function UserMasterPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<UserModel>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [empCheck, setEmpCheck] = useState<{ status: "idle" | "checking" | "valid" | "invalid"; name?: string }>({ status: "idle" });
  const empCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEmployeeIdChange(value: string) {
    setEditing((prev) => ({ ...prev, employeeId: value }));
    if (empCheckTimer.current) clearTimeout(empCheckTimer.current);
    if (editing.userType !== "EMPLOYEE") { setEmpCheck({ status: "idle" }); return; } // no HR record to check for non-employee types
    if (!value.trim()) { setEmpCheck({ status: "idle" }); return; }
    setEmpCheck({ status: "checking" });
    empCheckTimer.current = setTimeout(async () => {
      try {
        const result = await usersApi.verifyEmployee(value.trim());
        setEmpCheck(result.found ? { status: "valid", name: result.employeeName ?? undefined } : { status: "invalid" });
      } catch {
        setEmpCheck({ status: "invalid" });
      }
    }, 500);
  }

  async function load() {
    setLoading(true);
    setUsers(await usersApi.list());
    setLoading(false);
  }
  useEffect(() => { void load(); void rolesApi.list().then(setRoles); }, []);

  const filtered = useMemo(
    () => users.filter((u) => u.fullName.toLowerCase().includes(deferredSearch.toLowerCase()) || (u.employeeId ?? "").toLowerCase().includes(deferredSearch.toLowerCase())),
    [users, deferredSearch],
  );

  function openCreate() {
    setEditing({
      status: "ACTIVE", userType: "EMPLOYEE", securityLevel: 10, maxSessions: 1,
      loginWorkdaysOnly: "Y", loginFromTime: "00:00", loginToTime: "23:59",
      validFrom: new Date().toISOString().slice(0, 10), roleId: roles[0]?.roleId,
    });
    setFieldErrors({});
    setEmpCheck({ status: "idle" });
    setDialogOpen(true);
  }
  function openEdit(user: UserModel) {
    setEditing({ ...user, password: "" });
    setFieldErrors({});
    setEmpCheck({ status: "idle" }); // editing an existing user - Employee ID is locked, no re-check needed
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status !== "valid") {
      showToast("Verify a valid, active Employee ID from the HR master before saving.", "error");
      return;
    }
    const schema = editing.userId ? userEditSchema : userCreateSchema;
    const result = validate<Partial<UserModel>>(schema, editing);
    if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const apiResult = editing.userId ? await usersApi.update(editing.userId, result.data) : await usersApi.create(result.data);
      if (!apiResult.success) { showToast(apiResult.message, "error"); return; }
      const newPassword = (result.data as { password?: string }).password;
      if (editing.userId && newPassword) await usersApi.changePassword(editing.userId, newPassword);
      showToast(apiResult.generatedCode ? `${apiResult.message} Code: ${apiResult.generatedCode}` : apiResult.message, "success");
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(userId: number) {
    const ok = await confirm({ title: "Deactivate user", message: "Deactivate this user? Blocked if they still have direct reports.", confirmLabel: "Deactivate", danger: true });
    if (!ok) return;
    const result = await usersApi.remove(userId);
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) await load();
  }

  return (
    <div>
      <SectionHeading title="User Master" subtitle={`${users.length} records`}
        action={<div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." maxLength={100} className={`${inputCls} w-56`} />
          <PrimaryButton onClick={openCreate}>+ New</PrimaryButton>
        </div>} />
      <Card className="overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 text-left border-b border-slate-200">
              <th className="px-4 py-3 font-semibold">Code</th><th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Employee ID</th><th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRow colSpan={6} /> : filtered.length === 0 ? <EmptyRow colSpan={6} /> : filtered.map((u) => (
              <tr key={u.userId} className="border-t border-slate-100 hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3"><Code>{u.userCode}</Code></td>
                <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{u.employeeId}</td>
                <td className="px-4 py-3"><RoleBadge role={u.roleName} /></td>
                <td className="px-4 py-3"><StatusPill status={u.status} /></td>
                <td className="px-4 py-3 text-right">
                  <IconAction label="Edit" onClick={() => openEdit(u)} />
                  <IconAction label="Delete" danger onClick={() => handleDelete(u.userId)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {dialogOpen && (
        <Modal title={editing.userId ? "Edit User" : "New User"} wide onClose={() => setDialogOpen(false)}
          footer={<><SecondaryButton onClick={() => setDialogOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton></>}>
          <div className="grid grid-cols-2 gap-4">
            {editing.userId ? (
              <Field label="User Code"><input className={fieldInputCls()} disabled value={editing.userCode ?? ""} /></Field>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 self-end mb-3">User code is auto-generated (e.g. USR010) — not editable.</div>
            )}
            <Field label="Full Name" required error={fieldErrors.fullName}>
              <input className={fieldInputCls(fieldErrors.fullName)} maxLength={150} value={editing.fullName ?? ""} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} />
            </Field>
            <Field label="User Type" error={fieldErrors.userType}>
              <select className={fieldInputCls(fieldErrors.userType)} disabled={!!editing.userId} value={editing.userType ?? "EMPLOYEE"}
                onChange={(e) => { setEditing({ ...editing, userType: e.target.value as UserModel["userType"] }); setEmpCheck({ status: "idle" }); }}>
                <option value="EMPLOYEE">Employee</option>
                <option value="CONTRACT">Contract</option>
                <option value="CLIENT">Client</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="CUSTOMER">Customer</option>
                <option value="EXTERNAL">External</option>
              </select>
            </Field>
            <Field label={editing.userType === "EMPLOYEE" ? "Employee ID" : "Reference ID"} required
              hint={editing.userId ? undefined : editing.userType === "EMPLOYEE" ? "This becomes the login name - cannot change later" : "This becomes the login name - not checked against the HR master for non-employee types"}
              error={fieldErrors.employeeId}>
              <input className={fieldInputCls(fieldErrors.employeeId)} maxLength={50} disabled={!!editing.userId} value={editing.employeeId ?? ""} onChange={(e) => onEmployeeIdChange(e.target.value)} />
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "checking" && <span className="text-[11px] text-slate-400 mt-1 block">Checking HR master…</span>}
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "valid" && <span className="text-[11px] text-emerald-600 mt-1 block">✓ {empCheck.name ?? "Verified"} — active employee found</span>}
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "invalid" && <span className="text-[11px] text-rose-600 mt-1 block">✕ No active employee found with this ID in the HR master</span>}
            </Field>
            <Field label={editing.userId ? "New Password (leave blank to keep)" : "Password"} required={!editing.userId} error={fieldErrors.password}>
              <input type="password" autoComplete="new-password" className={fieldInputCls(fieldErrors.password)} maxLength={128} value={editing.password ?? ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required error={fieldErrors.roleId}>
              <select className={fieldInputCls(fieldErrors.roleId)} value={editing.roleId ?? ""} onChange={(e) => setEditing({ ...editing, roleId: Number(e.target.value) })}>
                {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
              </select>
            </Field>
            <Field label="Reporting To" error={fieldErrors.reportingTo}>
              <select className={fieldInputCls(fieldErrors.reportingTo)} value={editing.reportingTo ?? ""} onChange={(e) => setEditing({ ...editing, reportingTo: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— None —</option>
                {users.filter((u) => u.userId !== editing.userId).map((u) => <option key={u.userId} value={u.userId}>{u.fullName}</option>)}
              </select>
            </Field>
            <Field label="Valid From" error={fieldErrors.validFrom}>
              <input type="date" className={fieldInputCls(fieldErrors.validFrom)} value={editing.validFrom?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, validFrom: e.target.value })} />
            </Field>
            <Field label="Status" error={fieldErrors.status}>
              <select className={fieldInputCls(fieldErrors.status)} value={editing.status ?? "ACTIVE"} onChange={(e) => setEditing({ ...editing, status: e.target.value as UserModel["status"] })}>
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Email" error={fieldErrors.primaryEmail}>
              <input className={fieldInputCls(fieldErrors.primaryEmail)} maxLength={150} value={editing.primaryEmail ?? ""} onChange={(e) => setEditing({ ...editing, primaryEmail: e.target.value })} />
            </Field>
            <Field label="Primary Mobile" error={fieldErrors.primaryMobile}>
              <input className={fieldInputCls(fieldErrors.primaryMobile)} maxLength={20} value={editing.primaryMobile ?? ""} onChange={(e) => setEditing({ ...editing, primaryMobile: e.target.value })} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
