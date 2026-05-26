import { motion } from "framer-motion";

import GlassCard from "./GlassCard";

export default function StatCard({ icon: Icon, label, value, tone = "cyan" }) {
  const toneClass = tone === "blue" ? "from-blue-400 to-cyan-300" : "from-cyan-300 to-teal-200";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
      <GlassCard className="rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
          </div>
          <div className={`rounded-2xl bg-gradient-to-br ${toneClass} p-3 text-slate-950 shadow-lg shadow-cyan-500/20`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
