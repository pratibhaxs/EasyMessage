// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, className = "" }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 ${className}`}>
      {children}
    </p>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, loading, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
        ${disabled || loading
          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600 active:scale-[0.97] text-white shadow-sm hover:shadow"}
        ${className}`}>
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
        border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

export function DangerBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.97] ${className}`}>
      {children}
    </button>
  );
}

export function OutlineBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
        border-2 border-green-500 text-green-600 dark:text-green-400
        hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-[0.97]
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

// ── Input / Textarea ──────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>}
      <input
        className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700
          text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-green-400 transition
          ${error ? "border-red-400" : "border-gray-200 dark:border-gray-600"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>}
      <textarea
        className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700
          text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-green-400 transition resize-y
          ${error ? "border-red-400" : "border-gray-200 dark:border-gray-600"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>}
      <select
        className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700
          text-gray-800 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-green-400 transition
          ${error ? "border-red-400" : "border-gray-200 dark:border-gray-600"}
          ${className}`}
        {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
    green: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
