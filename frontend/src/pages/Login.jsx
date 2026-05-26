import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";

import GlassCard from "../components/GlassCard";
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to sign in");
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
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Welcome back</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Login to your workspace</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Use your account to open the team dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField("password")}
              required
            />
            <FiLock className="pointer-events-none absolute right-4 top-[43px] h-5 w-5 text-slate-500" />
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
            <FiArrowRight className="h-5 w-5" />
          </motion.button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-cyan-200 transition hover:text-white">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  );
}
