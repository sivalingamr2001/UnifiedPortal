import { useAuth } from "@/app/context/AuthContext";
import { menusApi } from "@/services/menusApi";
import { modulesApi } from "@/services/modulesApi";
import { roleMenuApi } from "@/services/roleMenuApi";
import { GetIcon } from "@/shared/components/GetIcon";

import {
  normalizeMenus,
  normalizeModuleAccess,
  normalizeModules,
} from "@/shared/lib/formatters";
import type { ModuleModel } from "@/types/models";
import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/apiClient";

const moduleToneMap: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  pes: "bg-blue-100 text-blue-700",
  "pes-lite": "bg-sky-100 text-sky-700",
  dms: "bg-emerald-100 text-emerald-700",
  scm: "bg-amber-100 text-amber-700",
  pms: "bg-pink-100 text-pink-700",
  mes: "bg-indigo-100 text-indigo-700",
  finance: "bg-teal-100 text-teal-700",
};

const getModuleTone = (module: ModuleModel) => {
  const key = (module.moduleCode ?? module.moduleName ?? "default")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return moduleToneMap[key] ?? "bg-slate-100 text-slate-700";
};

const getDefaultModuleId = (role: string | null, moduleList: ModuleModel[]) => {
  if (moduleList.length === 0) return null;

  const normalizedRole = (role ?? "").trim().toLowerCase();

  if (normalizedRole === "superAdmin") {
    const adminModule =
      moduleList.find((module) => {
        const moduleKey = (module.moduleCode ?? module.moduleName ?? "")
          .trim()
          .toLowerCase();
        return moduleKey === "admin" || moduleKey.includes("admin");
      }) ?? moduleList[0];

    return adminModule?.moduleId ?? null;
  }

  return moduleList[0]?.moduleId ?? null;
};

function DashboardPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleModel[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [loadingModules, setLoadingModules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleMappings, setRoleMappings] = useState<any[]>([]);

  const handleModuleClick = async (
    moduleId: number,
    currentModuleList: ModuleModel[] = modules,
    source: "user" | "auto" = "user",
    currentMappings: any[] = roleMappings,
  ) => {
    setSelectedModuleId(moduleId);

    try {
      const currentModule = currentModuleList.find((item) => item.moduleId === moduleId);
      const moduleName = currentModule?.moduleName ?? "Module";
      const moduleKey = (currentModule?.moduleCode ?? moduleName).trim().toLowerCase();



      const menusRes = await apiClient.post<any>("/query/execute", {
        queryNumber: 119,
        inputParameters: { ModuleId: moduleId }
      });
      let menus = normalizeMenus(menusRes);

      if (user && user.roleId) {
        const assignedMenuIds = new Set<number>(
          currentMappings.map((m: any) => m.MENU_ID ?? m.menuId)
        );
        const allowedMenuIds = new Set<number>();
        const includeMenuAndParents = (menuId: number) => {
          if (allowedMenuIds.has(menuId)) return;
          allowedMenuIds.add(menuId);
          const menu = menus.find((m) => m.menuId === menuId);
          if (menu && menu.parentMenuId) {
            includeMenuAndParents(menu.parentMenuId);
          }
        };
        assignedMenuIds.forEach((id) => includeMenuAndParents(id));
        menus = menus.filter((m) => allowedMenuIds.has(m.menuId));
      }

      window.dispatchEvent(
        new CustomEvent("portal:module-menus", {
          detail: {
            menus,
            moduleName,
            defaultMenu: currentModule?.defaultMenu ?? null,
            source,
          },
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menus");
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadModules = async () => {
      try {
        setLoadingModules(true);
        setError(null);

        const [allModulesRes, mappingsRes] = await Promise.all([
          apiClient.post<any>("/query/execute", { queryNumber: 101, inputParameters: {} }),
          apiClient.post<any>("/query/execute", { queryNumber: 113, inputParameters: { RoleId: user.roleId } }),
        ]);

        const rawMappings = mappingsRes.data || [];
        setRoleMappings(rawMappings);

        const assignedModuleIds = new Set<number>(
          rawMappings.map((m: any) => m.MODULE_ID ?? m.moduleId)
        );

        const assignedModules = normalizeModules(allModulesRes).filter(
          (module) => assignedModuleIds.has(module.moduleId)
        );

        setModules(assignedModules);

        const defaultModuleId = getDefaultModuleId(user.role, assignedModules);
        if (defaultModuleId !== null) {
          setSelectedModuleId(defaultModuleId);
          void handleModuleClick(defaultModuleId, assignedModules, "auto", rawMappings);
        } else {
          setSelectedModuleId(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load modules");
        setModules([]);
        setSelectedModuleId(null);
      } finally {
        setLoadingModules(false);
      }
    };

    void loadModules();
  }, [user?.userId, user?.role]);

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto font-sans">
      <div className="rounded-2xl border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[rgb(var(--color-muted))]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[rgb(var(--color-ink))]">
              Welcome back{user ? `, ${user.userName}` : ""}
            </h1>
          </div>

          {user && (
            <div className="self-start rounded-xl border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface2))] px-3 py-2 text-sm text-[rgb(var(--color-muted))] md:self-auto">
              <span className="font-medium text-[rgb(var(--color-ink))]">Role:</span>{" "}
              {user.role}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[rgb(var(--color-ink))] antialiased">
              Your Modules
            </h2>
            <p className="mt-1 text-xs font-normal tracking-wide text-[rgb(var(--color-muted))]">
              Click a module to open its navigation menu
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loadingModules && (
              <span className="animate-pulse text-xs text-[rgb(var(--color-muted))]">
                Loading...
              </span>
            )}
            {!loadingModules && modules.length > 0 && (
              <span className="whitespace-nowrap rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                {modules.length} available
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {modules.map((module) => {
            const isSelected = selectedModuleId === module.moduleId;
            const tone = getModuleTone(module);
            const description = module.description ?? `Access your ${module.moduleName} tools`;

            return (
              <button
                key={module.moduleId}
                type="button"
                onClick={() => void handleModuleClick(module.moduleId)}
                className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-surface2))] shadow-sm ring-1 ring-[rgb(var(--color-accent))]"
                    : "border-[rgb(var(--color-line))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))]/40 hover:shadow-md"
                }`}
              >
                <div>
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tone}`}
                  >
                    <GetIcon
                      name={module.moduleCode ?? module.moduleName ?? "default"}
                      className="h-5 w-5 stroke-[1.75]"
                    />
                  </div>

                  <div className="text-base font-bold tracking-tight text-[rgb(var(--color-ink))]">
                    {module.moduleName}
                  </div>

                  <p className="mt-1 text-[13px] font-normal leading-relaxed text-[rgb(var(--color-muted))]">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}

          {!loadingModules && modules.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[rgb(var(--color-line))] p-8 text-center text-sm text-[rgb(var(--color-muted))] sm:col-span-2 md:col-span-3 lg:col-span-4">
              No modules available for this user.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;