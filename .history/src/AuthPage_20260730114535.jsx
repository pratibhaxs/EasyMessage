import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function friendlyError(code) {
    const map = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "Email already registered.",
      "auth/invalid-email": "Invalid email address.",
      "auth/too-many-requests": "Too many attempts. Try later.",
      "auth/invalid-credential": "Invalid email or password.",
    };
    return map[code] || "Something went wrong.";
  }

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      mode === "signup" ? await signup(email, password) : await login(email, password);
    } catch (err) { setError(friendlyError(err.code)); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="w-full max-w-[340px]">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"></div>
          <span className="text-[15px] font-semibold text-zinc-800 dark:text-white">EasyMessage</span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-[12px] text-zinc-400 mb-5">
            {mode === "login" ? "Welcome back." : "Start sending personalised messages."}
          </p>

          {/* Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 mb-5 h-7">
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded text-xs font-medium transition-all duration-100
                  ${mode === m
                    ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full h-8 px-2.5 text-[13px] rounded-md border border-zinc-300 dark:border-zinc-700
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full h-8 px-2.5 text-[13px] rounded-md border border-zinc-300 dark:border-zinc-700
                  bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-[12px] text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className={`w-full mt-4 h-8 rounded-md text-xs font-medium transition-all duration-100
              ${loading
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white active:scale-[0.98]"}`}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
