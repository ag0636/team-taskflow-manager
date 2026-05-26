import { FiUser, FiUsers } from "react-icons/fi";

import PermissionNotice from "../PermissionNotice";

export default function ProjectMemberList({ members, loading, canManageMembers = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/5 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <FiUsers className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-white">No members yet</h3>
        <p className="mt-1 text-sm text-slate-400">Project members will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!canManageMembers ? (
        <PermissionNotice>
          Member list is read-only. Only the project owner can add or remove members.
        </PermissionNotice>
      ) : null}
      <ul className="space-y-3">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
            <FiUser className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">{member.full_name}</p>
            <p className="truncate text-sm text-slate-400">{member.email}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-300">
            {member.role}
          </span>
        </li>
      ))}
      </ul>
    </div>
  );
}
