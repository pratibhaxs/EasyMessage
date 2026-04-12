import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";
import { Card, SectionTitle, Badge } from "./ui";
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

function ChatBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[85%] bg-green-100 dark:bg-green-900/50 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-1 mt-1.5">
          <span className="text-[10px] text-gray-400">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="text-green-500 text-xs">✓✓</span>
        </div>
      </div>
    </div>
  );
}

// Desktop nav items
const NAV_ITEMS = [
  { key: "send", label: "Send Message", icon: "💬" },
  { key: "contacts", label: "Contacts", icon: "👥" },
  { key: "groups", label: "Groups", icon: "🏷️" },
  { key: "templates", label: "Templates", icon: "📝" },
  { key: "search", label: "Search", icon: "🔍" },
];

// Mobile tabs
const MOBILE_TABS = ["Send", "Contacts", "Groups", "Templates", "Search"];

export default function App() {
  const { user, logout } = useAuth();
  const { contacts, loading } = useApp();

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [links, setLinks] = useState([]);
  const [activeSection, setActiveSection] = useState("send");
  const [mobileTab, setMobileTab] = useState("Send");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  function handleTemplateSelect(t) {
    setActiveTemplate(t);
    setLinks([]);
    setActiveSection("contacts");
    setMobileTab("Contacts");
  }

  const previewMessage =
    activeTemplate && contacts.length > 0
      ? personalise(activeTemplate.text, contacts[0])
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-green-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">W</div>
            <span className="font-semibold text-gray-800 dark:text-white text-sm">Smart WA Sender</span>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {NAV_ITEMS.map((item) => (
                <button key={item.key} onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${activeSection === item.key
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">{user?.email}</span>
            <button onClick={() => setDark((d) => !d)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={logout}
              className="py-1.5 px-3 rounded-xl text-xs font-medium border border-gray-200 dark:border-gray-600
                text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-14 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {MOBILE_TABS.map((tab) => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors
                ${mobileTab === tab
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Active template banner */}
        {activeTemplate && (
          <div className="mb-4 flex items-center justify-between px-4 py-3 bg-green-50 dark:bg-green-900/20
            border border-green-200 dark:border-green-800 rounded-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-green-500 text-sm flex-shrink-0">✓</span>
              <span className="text-xs text-green-700 dark:text-green-400 font-medium truncate">
                Active: {activeTemplate.text.slice(0, 60)}{activeTemplate.text.length > 60 ? "…" : ""}
              </span>
            </div>
            <button onClick={() => { setActiveTemplate(null); setLinks([]); }}
              className="text-xs text-green-600 dark:text-green-400 hover:underline flex-shrink-0 ml-2">
              Clear
            </button>
          </div>
        )}

        {/* ── Desktop layout ── */}
        <div className="hidden lg:block">

          {/* Send Message page */}
          {activeSection === "send" && (
            <SendMessage />
          )}

          {/* Contacts + bulk send page */}
          {activeSection === "contacts" && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 space-y-4">
                <ContactManager activeTemplate={activeTemplate?.text} onLinksGenerated={setLinks} />
              </div>
              <div className="col-span-4 space-y-4">
                {/* Preview */}
                <Card>
                  <SectionTitle>Bulk Preview</SectionTitle>
                  {previewMessage ? (
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4">
                      <p className="text-xs text-gray-400 mb-3 text-center">
                        For <span className="font-medium text-gray-600 dark:text-gray-300">{contacts[0]?.name}</span>
                      </p>
                      <ChatBubble message={previewMessage} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">💬</div>
                      <p className="text-xs text-gray-400">
                        {!activeTemplate ? "Select a template first" : "Add a contact to preview"}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Bulk links */}
                {links.length > 0 && (
                  <Card>
                    <SectionTitle>Open in WhatsApp</SectionTitle>
                    <div className="space-y-2">
                      {links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer"
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl
                            bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                            text-green-700 dark:text-green-400 font-medium text-sm
                            hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                          <span className="truncate">{link.name}</span>
                          <span className="flex-shrink-0 ml-2">→</span>
                        </a>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Groups page */}
          {activeSection === "groups" && (
            <div className="max-w-lg">
              <GroupManager />
            </div>
          )}

          {/* Templates page */}
          {activeSection === "templates" && (
            <div className="max-w-2xl">
              <TemplateManager onSelect={handleTemplateSelect} activeTemplateId={activeTemplate?.id} />
            </div>
          )}

          {/* Search page */}
          {activeSection === "search" && (
            <div className="max-w-2xl">
              <SearchFilter />
            </div>
          )}
        </div>

        {/* ── Mobile layout ── */}
        <div className="lg:hidden space-y-4">
          {mobileTab === "Send" && <SendMessage />}
          {mobileTab === "Contacts" && (
            <>
              <ContactManager activeTemplate={activeTemplate?.text} onLinksGenerated={setLinks} />
              {links.length > 0 && (
                <Card>
                  <SectionTitle>Open in WhatsApp</SectionTitle>
                  <div className="space-y-2">
                    {links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl
                          bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                          text-green-700 dark:text-green-400 font-medium text-sm hover:bg-green-100 transition-colors">
                        <span className="truncate">{link.name}</span>
                        <span>→</span>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
          {mobileTab === "Groups" && <GroupManager />}
          {mobileTab === "Templates" && (
            <TemplateManager onSelect={handleTemplateSelect} activeTemplateId={activeTemplate?.id} />
          )}
          {mobileTab === "Search" && <SearchFilter />}
        </div>

      </main>
    </div>
  );
}