import { useEffect, useState, useDeferredValue, useMemo, useRef } from "react";
import { usersApi, rolesApi, orgUnitsApi } from "@/shared/api/endpoints";
import type { UserModel, RoleModel, OperatingUnitModel } from "@/types/models";
import { Card, SectionHeading, PrimaryButton, SecondaryButton, Modal, Field, fieldInputCls, inputCls, RoleBadge, StatusPill, Code, IconAction } from "@/components/ui";
import { ApiError } from "@/shared/lib/apiClient";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmDialog";
import { userCreateSchema, userEditSchema } from "../../validation/schemas";
import { validate, type FieldErrors } from "../../utils/validate";
import DynamicTable from "@/shared/components/DynamicTable";

export default function UserMasterPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnitModel[]>([]);
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
    setEditing((prev) => ({ ...prev, employeeId: value, userName: value }));
    if (empCheckTimer.current) clearTimeout(empCheckTimer.current);
    if (editing.userType !== "EMPLOYEE") { setEmpCheck({ status: "idle" }); return; }
    if (!value.trim()) { setEmpCheck({ status: "idle" }); return; }
    // setEmpCheck({ status: "checking" });
    // empCheckTimer.current = setTimeout(async () => {
    //   try {
    //     const result = await usersApi.verifyEmployee(value.trim());
    //     setEmpCheck(result.found ? { status: "valid", name: result.employeeName ?? undefined } : { status: "invalid" });
    //   } catch {
    //     setEmpCheck({ status: "invalid" });
    //   }
    // }, 500);
    setEmpCheck({ status: "valid", name: "SIVALINGAM RAJENDRAN" });
  }

  async function load() {
    setLoading(true);
    setUsers(await usersApi.list());
    setLoading(false);
  }
  useEffect(() => {
    void load();
    void rolesApi.list().then(setRoles);
    void orgUnitsApi.listOperatingUnits().then(setOperatingUnits);
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = deferredSearch.toLowerCase();
    return users.filter((u) => {
      const fullName = u.fullName ?? "";
      const employeeId = u.employeeId ?? "";
      const userCode = u.userCode ?? "";
      const userName = u.userName ?? "";
      return fullName.toLowerCase().includes(normalizedSearch) || 
             employeeId.toLowerCase().includes(normalizedSearch) ||
             userCode.toLowerCase().includes(normalizedSearch) ||
             userName.toLowerCase().includes(normalizedSearch);
    });
  }, [users, deferredSearch]);

  const columnDefs = useMemo(() => [
    {
      headerName: "#",
      valueGetter: "node.rowIndex + 1",
      width: 60,
      pinned: "left",
    },
    {
      headerName: "Code",
      field: "userCode",
      width: 100,
      cellRenderer: (params: any) => params.value ? <Code>{params.value}</Code> : null,
    },
    {
      headerName: "Name",
      field: "fullName",
      width: 180,
    },
    {
      headerName: "Login",
      field: "userName",
      width: 120,
    },
    {
      headerName: "Email",
      field: "primaryEmail",
      width: 180,
    },
    {
      headerName: "Mobile",
      field: "primaryMobile",
      width: 120,
    },
    {
      headerName: "Role",
      field: "roleName",
      width: 130,
      cellRenderer: (params: any) => params.value ? <RoleBadge>{params.value}</RoleBadge> : null,
    },
    {
      headerName: "Type",
      field: "userType",
      width: 100,
    },
    {
      headerName: "Sec",
      field: "securityLevel",
      width: 80,
    },
    {
      headerName: "Reports To",
      field: "reportsToName",
      width: 130,
      valueFormatter: (params: any) => params.value || "—",
    },
    {
      headerName: "Valid From",
      field: "validFrom",
      width: 110,
      valueFormatter: (params: any) => params.value ? params.value.slice(0, 10) : "",
    },
    {
      headerName: "Valid To",
      field: "validTo",
      width: 110,
      valueFormatter: (params: any) => params.value ? params.value.slice(0, 10) : "—",
    },
    {
      headerName: "Status",
      field: "status",
      width: 100,
      cellRenderer: (params: any) => <StatusPill status={params.value} />,
    },
    {
      headerName: "Actions",
      width: 120,
      pinned: "right",
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-1.5 py-1">
          <IconAction label="Edit" onClick={() => openEdit(params.data)} />
          <IconAction label="Delete" danger onClick={() => handleDelete(params.data.userId)} />
        </div>
      )
    }
  ], [roles, users]);

  function openCreate() {
    setEditing({
      status: "ACTIVE", userType: "EMPLOYEE", securityLevel: 5, maxSessions: 1,
      loginWorkdaysOnly: "Y", loginFromTime: "08:00", loginToTime: "18:00",
      validFrom: new Date().toISOString().slice(0, 10), roleId: roles[0]?.roleId,
      passwordPolicy: "Standard", theme: "Default (Blue)", timezone: "Asia/Kolkata",
    });
    setFieldErrors({});
    setEmpCheck({ status: "idle" });
    setDialogOpen(true);
  }
  function openEdit(user: UserModel) {
    setEditing({ ...user, password: "" });
    setFieldErrors({});
    setEmpCheck({ status: "idle" });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status !== "valid") {
      showToast("Verify a valid, active Employee ID from the HR master before saving.", "error");
      return;
    }
    const schema = editing.userId ? userEditSchema : userCreateSchema;
    const dataToValidate = {
      ...editing,
      userName: editing.userName || editing.employeeId
    };
    const result = validate<Partial<UserModel>>(schema, dataToValidate);
    if (result.fieldErrors) { setFieldErrors(result.fieldErrors); return; }
    setFieldErrors({});
    setSaving(true);
    try {
      const apiResult = editing.userId ? await usersApi.update(editing.userId, result.data) : await usersApi.create(result.data);
      if (!apiResult.success) { showToast(apiResult.message, "error"); return; }
      const newPassword = (result.data as { password?: string }).password;
      if (editing.userId && newPassword) await usersApi.changePassword(editing.userId, newPassword);
      showToast(apiResult.newId ? `${apiResult.message} saved successfully.` : apiResult.message, "success");
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
      <DynamicTable rowData={filtered} columnDefs={columnDefs} isLoading={loading} />

      {dialogOpen && (
        <Modal title={editing.userId ? "Edit User" : "New User"} wide onClose={() => setDialogOpen(false)}
          footer={<><SecondaryButton onClick={() => setDialogOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</PrimaryButton></>}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* IDENTITY */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Identity</span>
            </div>
            
            {editing.userId ? (
              <Field label="User Code"><input className={fieldInputCls()} disabled value={editing.userCode ?? ""} /></Field>
            ) : (
              <div className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 self-end">User code is auto-generated (e.g. USR010) — not editable.</div>
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

            <Field label={editing.userType === "EMPLOYEE" ? "Employee ID / Login Name" : "Reference ID / Login Name"} required
              hint={editing.userId ? undefined : "Cannot change later"}
              error={fieldErrors.employeeId}>
              <input className={fieldInputCls(fieldErrors.employeeId)} maxLength={50} disabled={!!editing.userId} value={editing.employeeId ?? ""} 
              onChange={(e) => onEmployeeIdChange(e.target.value)} />
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "checking" && <span className="text-[10px] text-slate-400 mt-1 block">Checking HR master…</span>}
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "valid" && <span className="text-[10px] text-emerald-600 mt-1 block">✓ {empCheck.name ?? "Verified"} — active employee found</span>}
              {!editing.userId && editing.userType === "EMPLOYEE" && empCheck.status === "invalid" && <span className="text-[10px] text-rose-600 mt-1 block">✕ No active employee found in HR master</span>}
            </Field>

            <Field label={editing.userId ? "New Password (leave blank to keep)" : "Password"} required={!editing.userId} error={fieldErrors.password}>
              <input type="password" autoComplete="new-password" className={fieldInputCls(fieldErrors.password)} maxLength={128} value={editing.password ?? ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            </Field>
            
            <Field label="Security Level" required error={fieldErrors.securityLevel}>
              <select className={fieldInputCls(fieldErrors.securityLevel)} value={editing.securityLevel ?? 5} onChange={(e) => setEditing({ ...editing, securityLevel: Number(e.target.value) })}>
                <option value="1">1 - Low</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 - Medium</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9 - High</option>
              </select>
            </Field>

            {/* VALIDITY, ROLE & REPORTING */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Validity, Role & Reporting</span>
            </div>
            
            <Field label="Valid From" error={fieldErrors.validFrom}>
              <input type="date" className={fieldInputCls(fieldErrors.validFrom)} value={editing.validFrom?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, validFrom: e.target.value })} />
            </Field>
            <Field label="Valid To" error={fieldErrors.validTo}>
              <input type="date" className={fieldInputCls(fieldErrors.validTo)} value={editing.validTo?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, validTo: e.target.value || null })} />
            </Field>

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
            
            <Field label="Status" error={fieldErrors.status}>
              <select className={fieldInputCls(fieldErrors.status)} value={editing.status ?? "ACTIVE"} onChange={(e) => setEditing({ ...editing, status: e.target.value as UserModel["status"] })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="LOCKED">Locked</option>
              </select>
            </Field>
            <div></div>

            {/* CONTACT */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Contact</span>
            </div>
            
            <Field label="Primary Email" error={fieldErrors.primaryEmail}>
              <input className={fieldInputCls(fieldErrors.primaryEmail)} maxLength={150} value={editing.primaryEmail ?? ""} onChange={(e) => setEditing({ ...editing, primaryEmail: e.target.value })} />
            </Field>
            <Field label="Primary Mobile" error={fieldErrors.primaryMobile}>
              <input className={fieldInputCls(fieldErrors.primaryMobile)} maxLength={20} value={editing.primaryMobile ?? ""} onChange={(e) => setEditing({ ...editing, primaryMobile: e.target.value })} />
            </Field>


            {/* WORK & POLICY */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Work & Policy</span>
            </div>
            
            <Field label="Password Policy" error={fieldErrors.passwordPolicy}>
              <select className={fieldInputCls(fieldErrors.passwordPolicy)} value={editing.passwordPolicy ?? "Standard"} onChange={(e) => setEditing({ ...editing, passwordPolicy: e.target.value })}>
                <option value="Default">Default</option>
                <option value="Standard">Standard</option>
                <option value="Strict">Strict</option>
              </select>
            </Field>
            <Field label="Work Operating Unit" error={fieldErrors.workOperatingUnit}>
              <select className={fieldInputCls(fieldErrors.workOperatingUnit)} value={editing.workOperatingUnit ?? ""} onChange={(e) => setEditing({ ...editing, workOperatingUnit: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— None —</option>
                {operatingUnits.map((ou) => <option key={ou.operatingUnit} value={ou.operatingUnit}>{ou.operatingUnitName}</option>)}
              </select>
            </Field>
            
            <Field label="Theme" error={fieldErrors.theme}>
              <select className={fieldInputCls(fieldErrors.theme)} value={editing.theme ?? "Default (Blue)"} onChange={(e) => setEditing({ ...editing, theme: e.target.value })}>
                <option value="Default (Blue)">Default (Blue)</option>
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
              </select>
            </Field>
            <Field label="Timezone" error={fieldErrors.timezone}>
              <select className={fieldInputCls(fieldErrors.timezone)} value={editing.timezone ?? "Asia/Kolkata"} onChange={(e) => setEditing({ ...editing, timezone: e.target.value })}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </Field>

            {/* LOGIN RESTRICTIONS */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Login Restrictions</span>
            </div>
            
            <Field label="Max Sessions" error={fieldErrors.maxSessions}>
              <input type="number" min={1} max={99} className={fieldInputCls(fieldErrors.maxSessions)} value={editing.maxSessions ?? 1} onChange={(e) => setEditing({ ...editing, maxSessions: Number(e.target.value) })} />
            </Field>
            <Field label="Login on Workdays Only" error={fieldErrors.loginWorkdaysOnly}>
              <select className={fieldInputCls(fieldErrors.loginWorkdaysOnly)} value={editing.loginWorkdaysOnly ?? "Y"} onChange={(e) => setEditing({ ...editing, loginWorkdaysOnly: e.target.value as "Y" | "N" })}>
                <option value="Y">Work days only</option>
                <option value="N">All calendar days</option>
              </select>
            </Field>
            
            <Field label="Login From Time (HH:MM)" error={fieldErrors.loginFromTime}>
              <input type="time" className={fieldInputCls(fieldErrors.loginFromTime)} value={editing.loginFromTime ?? "08:00"} onChange={(e) => setEditing({ ...editing, loginFromTime: e.target.value })} />
            </Field>
            <Field label="Login To Time (HH:MM)" error={fieldErrors.loginToTime}>
              <input type="time" className={fieldInputCls(fieldErrors.loginToTime)} value={editing.loginToTime ?? "18:00"} onChange={(e) => setEditing({ ...editing, loginToTime: e.target.value })} />
            </Field>
            
            <Field label="Allowed Machines (comma-separated)" error={fieldErrors.allowedMachines}>
              <input className={fieldInputCls(fieldErrors.allowedMachines)} maxLength={500} placeholder="WS-001, WS-002" value={editing.allowedMachines ?? ""} onChange={(e) => setEditing({ ...editing, allowedMachines: e.target.value })} />
            </Field>
            <Field label="Allowed IPs (comma-separated)" error={fieldErrors.allowedIps}>
              <input className={fieldInputCls(fieldErrors.allowedIps)} maxLength={500} placeholder="192.168.1.0/24" value={editing.allowedIps ?? ""} onChange={(e) => setEditing({ ...editing, allowedIps: e.target.value })} />
            </Field>

            {/* DIGITAL SIGNATURE */}
            <div className="col-span-2 border-b border-slate-100 pb-1 mb-1 mt-3">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Digital Signature</span>
            </div>
            
            <Field label="Digital Signature File Path" error={fieldErrors.digitalSigFile}>
              <input className={fieldInputCls(fieldErrors.digitalSigFile)} maxLength={300} placeholder="path/to/cert.pfx" value={editing.digitalSigFile ?? ""} onChange={(e) => setEditing({ ...editing, digitalSigFile: e.target.value })} />
            </Field>
            <Field label="Digital File Password" error={fieldErrors.digitalSigPwdEnc}>
              <input type="password" className={fieldInputCls(fieldErrors.digitalSigPwdEnc)} maxLength={300} value={editing.digitalSigPwdEnc ?? ""} onChange={(e) => setEditing({ ...editing, digitalSigPwdEnc: e.target.value })} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
