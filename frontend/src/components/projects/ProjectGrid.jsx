import { FiFolderPlus } from "react-icons/fi";

import FilterEmptyState from "../filters/FilterEmptyState";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects, loading, onCreateClick, isFiltered = false }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/[0.06]" />
        ))}
      </div>
    );
  }

  if (!projects.length && isFiltered) {
    return (
      <FilterEmptyState
        title="No matching projects"
        description="Try a different search term or clear your filters to see all projects."
      />
    );
  }

  if (!projects.length) {
    return (
      <div className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/5 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <FiFolderPlus className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">No projects yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          Create your first project and start organizing tasks with your team.
        </p>
        <button
          onClick={onCreateClick}
          className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20"
        >
          Create project
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
}
