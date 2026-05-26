import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

import { getProjectMembers } from "../../api/projects";
import { toDateInputValue } from "../../utils/taskDisplay";
import TextInput from "../TextInput";

const defaultForm = {
  title: "",
  description: "",
  project_id: "",
  assigned_to: "",
  priority: "medium",
  status: "todo",
  due_date: "",
};

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusOptions = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const selectClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/80 focus:ring-4 focus:ring-cyan-400/10";

function SelectField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function taskToForm(task) {
  return {
    title: task.title || "",
    description: task.description || "",
    project_id: String(task.project_id),
    assigned_to: task.assigned_to ? String(task.assigned_to) : "",
    priority: task.priority || "medium",
    status: task.status || "todo",
    due_date: toDateInputValue(task.due_date),
  };
}

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  saving,
  projects,
  task = null,
  defaultProjectId = null,
  statusOnlyEdit = false,
}) {
  const isEdit = Boolean(task);
  const lockProject = !isEdit && defaultProjectId != null;
  const memberStatusEdit = isEdit && statusOnlyEdit;
  const [form, setForm] = useState(defaultForm);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit) {
      setForm(taskToForm(task));
    } else if (defaultProjectId != null) {
      setForm({ ...defaultForm, project_id: String(defaultProjectId) });
    } else {
      setForm(defaultForm);
    }
    setMembers([]);
  }, [open, isEdit, task, defaultProjectId]);

  useEffect(() => {
    if (!form.project_id) {
      setMembers([]);
      return undefined;
    }

    let mounted = true;
    setLoadingMembers(true);

    getProjectMembers(form.project_id)
      .then((data) => {
        if (mounted) {
          setMembers(data);
        }
      })
      .catch(() => {
        if (mounted) {
          toast.error("Unable to load project members");
          setMembers([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingMembers(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [form.project_id]);

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "project_id" && !isEdit && !lockProject) {
        next.assigned_to = "";
      }

      return next;
    });
  };

  const buildDueDate = () => (form.due_date ? new Date(`${form.due_date}T12:00:00`).toISOString() : null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isEdit) {
      const payload = memberStatusEdit
        ? { status: form.status }
        : {
            title: form.title.trim(),
            description: form.description.trim() || null,
            priority: form.priority,
            status: form.status,
            assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
            due_date: buildDueDate(),
          };

      try {
        await onSubmit(payload, task.id);
        onClose();
      } catch {
        // Parent hook surfaces API errors via toast.
      }

      return;
    }

    const projectId = Number(form.project_id);

    if (!projectId) {
      toast.error("Select a project");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      project_id: projectId,
      priority: form.priority,
      status: form.status,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      due_date: buildDueDate(),
    };

    try {
      await onSubmit(payload);
      setForm(defaultForm);
      onClose();
    } catch {
      // Parent hook surfaces API errors via toast.
    }
  };

  const hasProjects = projects.length > 0;
  const lockedProjectName =
    projects.find((project) => project.id === defaultProjectId)?.name ||
    projects.find((project) => String(project.id) === form.project_id)?.name;
  const editProjectName =
    task?.projectName || projects.find((project) => project.id === task?.project_id)?.name;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="my-8 w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/40"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200">
                  {memberStatusEdit ? "Update status" : isEdit ? "Edit task" : "New task"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {memberStatusEdit ? "Task status" : isEdit ? "Update task" : "Create task"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {!hasProjects && !isEdit ? (
              <div className="rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/5 p-5 text-sm leading-6 text-slate-400">
                Create a project first, then you can add tasks to it.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                {memberStatusEdit ? (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                    As a project member you can update the status for{" "}
                    <span className="font-medium text-slate-200">{task.title}</span>.
                  </p>
                ) : (
                  <>
                    <TextInput
                      label="Title"
                      placeholder="Ship onboarding flow"
                      value={form.title}
                      onChange={updateField("title")}
                      required
                    />

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
                      <textarea
                        value={form.description}
                        onChange={updateField("description")}
                        placeholder="What needs to get done?"
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/80 focus:ring-4 focus:ring-cyan-400/10"
                      />
                    </label>
                  </>
                )}

                {!memberStatusEdit && (isEdit || lockProject) ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    <span className="block text-sm font-medium text-slate-300">Project</span>
                    <p className="mt-1 text-sm text-white">
                      {isEdit
                        ? editProjectName || `Project #${task.project_id}`
                        : lockedProjectName || `Project #${defaultProjectId}`}
                    </p>
                  </div>
                ) : !memberStatusEdit ? (
                  <SelectField label="Project">
                    <select
                      value={form.project_id}
                      onChange={updateField("project_id")}
                      required
                      className={selectClassName}
                    >
                      <option value="" className="bg-slate-950">
                        Select project
                      </option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id} className="bg-slate-950">
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </SelectField>
                ) : null}

                {!memberStatusEdit ? (
                  <SelectField label="Assignee">
                    <select
                      value={form.assigned_to}
                      onChange={updateField("assigned_to")}
                      disabled={!form.project_id || loadingMembers}
                      className={`${selectClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="" className="bg-slate-950">
                        {loadingMembers ? "Loading members..." : "Unassigned"}
                      </option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id} className="bg-slate-950">
                          {member.full_name}
                        </option>
                      ))}
                    </select>
                  </SelectField>
                ) : null}

                {memberStatusEdit ? (
                  <SelectField label="Status">
                    <select
                      value={form.status}
                      onChange={updateField("status")}
                      className={selectClassName}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-950">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </SelectField>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="Priority">
                      <select
                        value={form.priority}
                        onChange={updateField("priority")}
                        className={selectClassName}
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </SelectField>

                    <SelectField label="Status">
                      <select
                        value={form.status}
                        onChange={updateField("status")}
                        className={selectClassName}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </SelectField>
                  </div>
                )}

                {!memberStatusEdit ? (
                  <TextInput
                    label="Due date"
                    type="date"
                    value={form.due_date}
                    onChange={updateField("due_date")}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create task"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
