import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import TextInput from "../TextInput";

export default function CreateProjectModal({ open, onClose, onSubmit, creating }) {
  const [form, setForm] = useState({ name: "", description: "" });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onSubmit({
        name: form.name,
        description: form.description || null,
      });
      setForm({ name: "", description: "" });
      onClose();
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Unable to create project");
    }
  };

  return (
    <AnimatePresence>
      {open ? (
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
            className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/40"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">New project</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Create project</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TextInput
                label="Project name"
                placeholder="Product launch"
                value={form.name}
                onChange={updateField("name")}
                minLength={3}
                required
              />

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={updateField("description")}
                  placeholder="What will this team accomplish?"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/80 focus:ring-4 focus:ring-cyan-400/10"
                />
              </label>

              <button
                disabled={creating}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create project"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
