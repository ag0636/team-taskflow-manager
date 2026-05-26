import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";

import GlassCard from "../components/GlassCard";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "member",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signup(form);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
    >
      <GlassCard className="rounded-[2rem] p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Start organized</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create your account</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Join the workspace and begin coordinating team tasks.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <TextInput
              label="Full name"
              placeholder="Alex Morgan"
              value={form.fullName}
              onChange={updateField("fullName")}
              required
              minLength={2}
            />
            <FiUser className="pointer-events-none absolute right-4 top-[43px] h-5 w-5 text-slate-500" />
          </div>

          <div className="relative">
            <TextInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={updateField("email")}
              required
            />
            <FiMail className="pointer-events-none absolute right-4 top-[43px] h-5 w-5 text-slate-500" />
          </div>

          <div className="relative">
            <TextInput
              label="Password"
              type="password"
              placeholder="At least 8 chars with a number"
              value={form.password}
              onChange={updateField("password")}
              required
              minLength={8}
            />
            <FiLock className="pointer-events-none absolute right-4 top-[43px] h-5 w-5 text-slate-500" />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Role</span>
            <select
              value={form.role}
              onChange={updateField("role")}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/80 focus:ring-4 focus:ring-cyan-400/10"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
            <FiArrowRight className="h-5 w-5" />
          </motion.button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cyan-200 transition hover:text-white">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  );
}
