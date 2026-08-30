import { useEffect, useState } from "react";
import { userAccessRightsApi, usersApi, orgUnitsApi } from "@/api/endpoints";
import type { UserModel, OperatingUnitModel, OrganizationModel, UserAccessRightsModel, OrgUnitLine } from "@/types/models";
import { Card, SectionHeading, PrimaryButton, Field, fieldInputCls, RoleBadge } from "@/components/ui";
import { ApiError } from "@/api/axiosClient";
import { useToast } from "@/components/Toast";

export default function UserAccessRightsPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [operatingUnits, setOperatingUnits] = useState<OperatingUnitModel[]>([]);
  const [orgsByOu, setOrgsByOu] = useState<Record<number, OrganizationModel[]>>({});
  const [rights, setRights] = useState<UserAccessRightsModel | null>(null);
  const [selectedLines, setSelectedLines] = useState<Map<string, OrgUnitLine>>(new Map());
  const [accessChannel, setAccessChannel] = useState<UserAccessRightsModel["accessChannel"]>("SYSTEM");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void usersApi.list().then(setUsers);
    void orgUnitsApi.listOperatingUnits().then(setOperatingUnits);
  }, []);

  async function loadOrgsFor(ou: number) {
    if (orgsByOu[ou]) return;
    const orgs = await orgUnitsApi.listOrganizations(ou);
    setOrgsByOu((prev) => ({ ...prev, [ou]: orgs }));
  }
  useEffect(() => { operatingUnits.forEach((ou) => void loadOrgsFor(ou.operatingUnit)); }, [operatingUnits]);

  async function selectUser(userId: number) {
    setSelectedUserId(userId);
    setLoading(true);
    try {
      const existing = await userAccessRightsApi.getByUser(userId);
      setRights(existing);
      setAccessChannel(existing.accessChannel || "SYSTEM");
      const map = new Map<string, OrgUnitLine>();
      (existing.orgUnits || []).forEach((line) => map.set(`${line.operatingUnit}:${line.organizationId}`, line));
      setSelectedLines(map);
    } catch {
      setRights(null);
      setAccessChannel("SYSTEM");
      setSelectedLines(new Map());
    } finally {
      setLoading(false);
    }
  }

  function toggleLine(ou: number, org: OrganizationModel) {
    const key = `${ou}:${org.organizationId}`;
    setSelectedLines((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, { uarId: 0, operatingUnit: ou, operatingUnitName: null, organizationId: org.organizationId, organizationCode: org.organizationCode, limitValue: 0 });
      return next;
    });
  }

  function updateLimit(ou: number, orgId: number, value: number) {
    const key = `${ou}:${orgId}`;
    setSelectedLines((prev) => {
      const next = new Map(prev);
      const line = next.get(key);
      if (line) next.set(key, { ...line, limitValue: value });
      return next;
    });
  }

  async function handleSave() {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const result = await userAccessRightsApi.save({
        uarId: rights?.uarId ?? 0, userId: selectedUserId, userName: null,
        accessChannel, status: "ACTIVE", remarks: null,
        orgUnitsSelected: selectedLines.size, totalOrgUnits: rights?.totalOrgUnits ?? 0,
        orgUnits: Array.from(selectedLines.values()),
      });
      showToast(result.message, result.success ? "success" : "error");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  const selectedUser = users.find((u) => u.userId === selectedUserId);

  return (
    <div>
      <SectionHeading title="User Access Rights" subtitle="Multi-location access by Operating Unit and Organization" />
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-4 p-4 max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select User</div>
          {users.map((u) => (
            <button key={u.userId} onClick={() => void selectUser(u.userId)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors cursor-pointer ${selectedUserId === u.userId ? "bg-blue-50/55 border border-blue-200" : "hover:bg-slate-50 border border-transparent"}`}>
              <div className="text-sm font-medium text-slate-800">{u.fullName}</div>
              <div className="mt-1"><RoleBadge role={u.roleName} /></div>
            </button>
          ))}
        </Card>

        <Card className="col-span-8 p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
          {!selectedUserId ? (
            <div className="text-sm text-slate-400 text-center py-16">Select a user to manage their location access.</div>
          ) : loading ? (
            <div className="text-sm text-slate-400 text-center py-16">Loading…</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-slate-800">{selectedUser?.fullName} — {selectedLines.size} location(s) selected</div>
                <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Access Rights"}</PrimaryButton>
              </div>
              <div className="w-48 mb-4">
                <Field label="Access Channel">
                  <select className={fieldInputCls()} value={accessChannel} onChange={(e) => setAccessChannel(e.target.value as UserAccessRightsModel["accessChannel"])}>
                    <option value="SYSTEM">System</option><option value="MOBILE">Mobile</option><option value="BOTH">Both</option>
                  </select>
                </Field>
              </div>
              <div className="space-y-5 max-h-[45vh] overflow-y-auto pr-1">
                {operatingUnits.map((ou) => (
                  <div key={ou.operatingUnit}>
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">{ou.operatingUnitName ?? ou.name}</div>
                    <div className="space-y-1.5">
                      {(orgsByOu[ou.operatingUnit] ?? []).map((org) => {
                        const key = `${ou.operatingUnit}:${org.organizationId}`;
                        const line = selectedLines.get(key);
                        return (
                          <div key={org.organizationId} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                            <input type="checkbox" checked={!!line} onChange={() => toggleLine(ou.operatingUnit, org)} className="w-4 h-4 accent-blue-600" />
                            <span className="text-sm text-slate-800 flex-1">{org.organizationCode ?? org.name}</span>
                            {line && (
                              <input type="number" min={0} placeholder="Limit" value={line.limitValue} onChange={(e) => updateLimit(ou.operatingUnit, org.organizationId, Number(e.target.value))}
                                className="w-28 px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
