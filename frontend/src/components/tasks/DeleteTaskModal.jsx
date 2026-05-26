import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function DeleteTaskModal({ open, task, deleting, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && task ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/40"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-rose-300/25 bg-rose-300/10 text-rose-100">
                <FiAlertTriangle className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-white">Delete task?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              This will permanently remove{" "}
              <span className="font-medium text-slate-200">&ldquo;{task.title}&rdquo;</span>. This action cannot be
              undone.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-rose-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete task"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
