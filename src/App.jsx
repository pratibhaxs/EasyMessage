import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";
import ContactManager from "./ContactManager";
import GroupManager from "./GroupManager";
import TemplateManager from "./TemplateManager";
import SearchFilter from "./SearchFilter";
import SendMessage from "./SendMessage";

function personalise(template, contact) {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    contact[k] !== undefined && contact[k] !== "" ? contact[k] : `{${k}}`
  );
}

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    key: "send", label: "Send",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    key: "contacts", label: "Contacts",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: "templates", label: "Templates",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    key: "groups", label: "Groups",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    key: "search", label: "Search",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
      </svg>
    ),
  },
];

export default function App() {
  const { user, logout } = useAuth();
  const { contacts, loading } = useApp();
  const [dark, setDark] = useState(
  () => document.documentElement.classList.contains("dark"));
  const [section, setSection] = useState("send");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [links, setLinks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function toggleDark() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  setDark(isDark);
}

  function handleTemplateSelect(t) {
    setActiveTemplate(t);
    setLinks([]);
    setSection("contacts");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <svg className="animate-spin h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Sidebar (desktop) ── */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800
        bg-white dark:bg-zinc-900 transition-all duration-200
        ${sidebarOpen ? "w-48" : "w-14"}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 h-11 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</div>
          {sidebarOpen && <span className="text-[13px] font-semibold text-zinc-800 dark:text-white truncate">WA Sender</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium
                transition-all duration-100 text-left
                ${section === item.key
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200"}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Active template indicator */}
        {activeTemplate && sidebarOpen && (
          <div className="mx-2 mb-2 px-2 py-2 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <p className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">Active template</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 truncate">{activeTemplate.text.slice(0, 40)}…</p>
            <button onClick={() => { setActiveTemplate(null); setLinks([]); }}
              className="text-[10px] text-emerald-500 hover:underline mt-1">Clear</button>
          </div>
        )}

        {/* Bottom: user + controls */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-2 py-3 space-y-1">
          <button onClick={toggleDark}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px]
              text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <span className="flex-shrink-0 text-sm">{dark ? "○" : "◑"}</span>
            {sidebarOpen && <span>{dark ? "Light mode" : "Dark mode"}</span>}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px]
              text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {sidebarOpen && <span className="truncate">Sign out</span>}
          </button>
          {sidebarOpen && (
            <div className="px-2 pt-1">
              <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen((o) => !o)}
          className="absolute bottom-1/2 -right-3 w-6 h-6 rounded-full bg-white dark:bg-zinc-800
            border border-zinc-200 dark:border-zinc-700 flex items-center justify-center
            text-zinc-400 hover:text-zinc-600 shadow-sm z-10 hidden md:flex">
          <svg className={`w-3 h-3 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar (mobile only shows logo + controls) */}
        <div className="md:hidden flex items-center justify-between px-4 h-11
          border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">W</div>
            <span className="text-[13px] font-semibold text-zinc-800 dark:text-white">WA Sender</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="text-zinc-400 hover:text-zinc-600 text-sm">{dark ? "○" : "◑"}</button>
            <button onClick={logout} className="text-[12px] text-zinc-500 hover:text-zinc-700">Out</button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5">
          {section === "send" && <SendMessage />}
          {section === "contacts" && (
            <ContactManager
              activeTemplate={activeTemplate?.text}
              onLinksGenerated={setLinks}
              links={links}
              onGoToTemplates={() => setSection("templates")}
            />
          )}
          {section === "templates" && (
            <TemplateManager onSelect={handleTemplateSelect} activeTemplateId={activeTemplate?.id} />
          )}
          {section === "groups" && <GroupManager />}
          {section === "search" && <SearchFilter />}
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <div className="md:hidden flex border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {NAV.map((item) => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors
                ${section === item.key
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
