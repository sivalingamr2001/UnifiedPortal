import { useEffect, useState } from "react";
import { usersApi, rolesApi, modulesApi, menusApi, roleMenuApi } from "@/api/endpoints";
import type { UserModel, RoleModel, ModuleModel, MenuModel, ModuleAccessModel } from "@/types/models";
import { Card, RoleBadge } from "@/components/ui";

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [menus, setMenus] = useState<MenuModel[]>([]);
  const [moduleAccess, setModuleAccess] = useState<ModuleAccessModel[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [u, r, m, mn, ma] = await Promise.all([
        usersApi.list(), rolesApi.list(), modulesApi.list(), menusApi.list(), roleMenuApi.listModuleAccess(),
      ]);
      if (cancelled) return;
      setUsers(u); setRoles(r); setModules(m); setMenus(mn); setModuleAccess(ma);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <div>
      {loading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="rounded-2xl p-6 mb-5 bg-gradient-to-br from-accent/10 via-accent-soft to-transparent shadow-premium">
            <h1 className="font-display text-[26px] font-semibold text-ink">
              {activeUsers} active users across {roles.filter((r) => r.status === "ACTIVE").length} roles
            </h1>
            <p className="text-sm text-muted mt-1">Janatics Admin Module — identity, access &amp; security</p>
            <div className="flex gap-8 mt-5">
              <div><div className="font-display text-xl font-semibold text-ink">{users.length}</div><div className="text-xs text-muted">Total Users</div></div>
              <div><div className="font-display text-xl font-semibold text-ink">{roles.length}</div><div className="text-xs text-muted">Roles</div></div>
              <div><div className="font-display text-xl font-semibold text-ink">{modules.length}</div><div className="text-xs text-muted">Modules</div></div>
              <div><div className="font-display text-xl font-semibold text-ink">{menus.length}</div><div className="text-xs text-muted">Menu Items</div></div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <Card className="col-span-12 lg:col-span-6 p-5">
              <div className="text-sm font-semibold text-ink mb-4">Module Access Matrix</div>
              <div className="space-y-3.5">
                {modules.map((m) => {
                  const allowedCount = moduleAccess.filter((ma) => ma.moduleId === m.moduleId && ma.accessFlag === "ALLOWED").length;
                  const pct = roles.length === 0 ? 0 : (allowedCount / roles.length) * 100;
                  return (
                    <div key={m.moduleId}>
                      <div className="flex justify-between text-xs mb-1.5"><span className="font-medium text-ink">{m.moduleName}</span><span className="text-muted">{allowedCount}/{roles.length}</span></div>
                      <div className="h-2 bg-surface2 rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="col-span-12 lg:col-span-6 p-5">
              <div className="text-sm font-semibold text-ink mb-4">Recent Users</div>
              <div className="space-y-4">
                {users.slice(0, 6).map((u) => (
                  <div key={u.userId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="text-sm font-medium text-ink truncate">{u.fullName}</div><div className="text-[11px] text-muted">{u.reportsToName ? `→ ${u.reportsToName}` : "Root"}</div></div>
                    <RoleBadge role={u.roleName} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
