// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 ${className}`}>
      {children}
    </div>
  );
}

// ── Section label (Stripe-style uppercase) ────────────────────────────────────
export function Label({ children, className = "" }) {
  return (
    <p className={`text-[11px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 ${className}`}>
      {children}
    </p>
  );
}

export function Divider({ className = "" }) {
  return <div className={`border-t border-zinc-100 dark:border-zinc-800 ${className}`} />;
}

// ── Buttons (28px height) ─────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, loading, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium
        h-7 transition-all duration-100 select-none whitespace-nowrap
        ${disabled || loading
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
          : "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white"}
        ${className}`}>
      {loading && (
        <svg className="animate-spin h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none">
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
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium
        h-7 transition-all duration-100 select-none whitespace-nowrap border
        border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900
        text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800
        active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium
        h-7 transition-all duration-100 text-zinc-500 dark:text-zinc-400
        hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200
        active:scale-[0.97] ${className}`}>
      {children}
    </button>
  );
}

export function DangerGhostBtn({ children, onClick, className = "" }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs font-medium
        h-7 transition-all duration-100 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
        hover:text-red-500 active:scale-[0.97] ${className}`}>
      {children}
    </button>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────────
export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 gap-0.5 h-7">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`px-2.5 rounded text-xs font-medium transition-all duration-100 select-none
            ${value === opt.value
              ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Inputs (h-8 = 32px) ───────────────────────────────────────────────────────
const inputCls = (error) =>
  `w-full h-8 px-2.5 text-[13px] rounded-md border transition-all duration-100
  bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100
  placeholder-zinc-400 dark:placeholder-zinc-600
  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:focus:border-emerald-500
  ${error ? "border-red-400 dark:border-red-500" : "border-zinc-300 dark:border-zinc-700"}`;

export function Input({ label, error, hint, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</label>}
      <input className={`${inputCls(error)} ${className}`} {...props} />
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-[11px] text-zinc-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</label>}
      <textarea
        className={`w-full px-2.5 py-2 text-[13px] rounded-md border transition-all duration-100
          bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100
          placeholder-zinc-400 dark:placeholder-zinc-600 font-mono
          focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
          resize-y min-h-[72px] leading-relaxed
          ${error ? "border-red-400" : "border-zinc-300 dark:border-zinc-700"} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-[11px] text-zinc-400 mt-0.5">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full h-8 px-2.5 text-[13px] rounded-md border transition-all duration-100
          bg-white dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100
          focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
          ${error ? "border-red-400" : "border-zinc-300 dark:border-zinc-700"} ${className}`}
        {...props}>
        {children}
      </select>
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "zinc", onClick, active = false }) {
  const map = {
    zinc: active
      ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
    green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    red: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
        transition-colors duration-100 ${map[color]} ${onClick ? "cursor-pointer" : ""}`}>
      {children}
    </span>
  );
}

// ── Empty state (Notion-style, minimal) ───────────────────────────────────────
export function EmptyState({ title, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
      <p className="text-[13px] text-zinc-400 dark:text-zinc-500">{title}</p>
      {action && onAction && (
        <button onClick={onAction}
          className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
          {action}
        </button>
      )}
    </div>
  );
}
