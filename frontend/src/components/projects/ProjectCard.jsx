import { motion } from "framer-motion";
import { FiFolder, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function ProjectCard({ project, index }) {
  return (
    <Link to={`/projects/${project.id}`} className="block">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -5, scale: 1.01 }}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
            <FiFolder className="h-6 w-6" />
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-100">
            {project.userRole}
          </span>
        </div>

        <h3 className="mt-5 line-clamp-1 text-lg font-semibold text-white">{project.name}</h3>
        <p className="mt-2 min-h-[44px] text-sm leading-6 text-slate-400">
          {project.description || "No description yet."}
        </p>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <FiUsers className="h-4 w-4 text-cyan-200" />
            <span>{project.memberCount} members</span>
          </div>
          <span className="text-xs text-slate-500">#{project.id}</span>
        </div>
      </motion.article>
    </Link>
  );
}
