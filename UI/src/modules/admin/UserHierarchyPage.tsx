import { useEffect, useMemo, useState } from "react";
import { usersApi } from "@/api/endpoints";
import type { UserModel } from "@/types/models";
import { Card, SectionHeading, RoleBadge } from "@/components/ui";

interface TreeNode { user: UserModel; children: TreeNode[] }

function buildTree(users: UserModel[]): TreeNode[] {
  const byId = new Map<number, TreeNode>(users.map((u) => [u.userId, { user: u, children: [] }]));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    const parentId = node.user.reportingTo;
    if (parentId && byId.has(parentId)) byId.get(parentId)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-surface2">
        {node.children.length > 0 ? (
          <button onClick={() => setExpanded((e) => !e)} className="w-5 h-5 flex items-center justify-center text-muted text-xs">{expanded ? "▾" : "▸"}</button>
        ) : <span className="w-5" />}
        <span className="text-sm font-medium text-ink">{node.user.fullName}</span>
        <RoleBadge role={node.user.roleName} />
        <span className="text-xs text-muted">{node.user.employeeId}</span>
      </div>
      {expanded && node.children.map((child) => <TreeItem key={child.user.userId} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function UserHierarchyPage() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void usersApi.list().then((u) => { setUsers(u); setLoading(false); });
  }, []);

  const tree = useMemo(() => buildTree(users), [users]);

  return (
    <div>
      <SectionHeading title="User Hierarchy" subtitle="Reporting structure across the organization" />
      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-muted text-center py-16">Loading…</div>
        ) : tree.length === 0 ? (
          <div className="text-sm text-muted text-center py-16">No users found.</div>
        ) : tree.map((root) => <TreeItem key={root.user.userId} node={root} depth={0} />)}
      </Card>
    </div>
  );
}
