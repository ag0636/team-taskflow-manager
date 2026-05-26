import { FiFilter } from "react-icons/fi";

export default function FilterEmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/5 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
        <FiFilter className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
