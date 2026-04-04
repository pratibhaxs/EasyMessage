import { useState, useRef, useEffect } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

function personalise(template, contact) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    contact[key] !== undefined && contact[key] !== "" ? contact[key] : `{${key}}`
  );
}

function detectVars(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}

// ── sub-components ────────────────────────────────────────────────────────────

function StepBar({ current }) {
  const steps = ["Write Message", "Add Contacts", "Preview", "Send"];
  return (
    <div className="flex items-center justify-between mb-8 px-1">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${done ? "bg-green-500 text-white" : active ? "bg-green-600 text-white ring-4 ring-green-200 dark:ring-green-900" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"}`}>
                {done ? "✓" : num}
              </div>
              <span className={`mt-1 text-xs font-medium text-center leading-tight hidden sm:block
                ${active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded transition-all
                ${done ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
      {children}
    </p>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all
        ${disabled || loading
          ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white shadow-sm hover:shadow-md"}
        ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Generating links...
        </span>
      ) : children}
    </button>
  );
}

function SecondaryBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600
        text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
        active:scale-[0.98] transition-all ${className}`}
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold border-2 border-green-500
        text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20
        active:scale-[0.98] transition-all ${className}`}
    >
      {children}
    </button>
  );
}

// WhatsApp-style chat bubble with highlighted variables
function ChatBubble({ message, template }) {
  const vars = detectVars(template);
  const parts = [];
  let remaining = message;
  let idx = 0;

  // find which values in the message came from variable replacements
  vars.forEach((v) => {
    const placeholder = `{${v}}`;
    // check if the original template had this var replaced
  });

  // split message by replaced variable values to highlight them
  const regex = new RegExp(`(${vars.map((v) => `\\{${v}\\}`).join("|")})`, "g");
  const rawParts = template.split(regex);

  let cursor = 0;
  return (
    <div className="flex justify-end">
      <div className="relative max-w-xs sm:max-w-sm bg-green-100 dark:bg-green-900/50 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
          {rawParts.map((part, i) => {
            const isVar = /^\{(\w+)\}$/.test(part);
            if (isVar) {
              const key = part.slice(1, -1);
              return (
                <span key={i} className="bg-green-300 dark:bg-green-700 text-green-900 dark:text-green-100 rounded px-1 font-medium text-xs">
                  {message.includes(part) ? part : (() => {
                    // extract the replaced value from the personalised message
                    return part;
                  })()}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-green-500 text-xs">✓✓</span>
        </div>
        <div className="absolute top-0 right-[-6px] w-3 h-3 bg-green-100 dark:bg-green-900/50"
          style={{ clipPath: "polygon(0 0, 0 100%, 100% 0)" }} />
      </div>
    </div>
  );
}

// ── main app ──────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [template, setTemplate] = useState("");
  const [contacts, setContacts] = useState([]);
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [fields, setFields] = useState({ name: "", number: "" });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const templateVars = detectVars(template);
  const extraVars = templateVars.filter((v) => v !== "name" && v !== "number");

  // current step logic
  const currentStep = !template.trim() ? 1 : contacts.length === 0 ? 2 : links.length === 0 ? 3 : 4;

  function setField(key, val) {
    setFields((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function resetFields() {
    const base = { name: "", number: "" };
    extraVars.forEach((v) => (base[v] = ""));
    setFields(base);
  }

  function validate() {
    const errs = {};
    if (!fields.name.trim()) errs.name = "Name is required";
    const digits = (fields.number || "").replace(/\D/g, "");
    if (!digits) errs.number = "Number is required";
    else if (digits.length !== 10 && !(digits.startsWith("91") && digits.length === 12))
      errs.number = "Enter a valid 10-digit number";
    return errs;
  }

  function addOrSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const contact = { ...fields, name: fields.name.trim(), number: fields.number.trim() };
    if (editingId !== null) {
      setContacts((cs) => cs.map((c) => (c.id === editingId ? { ...contact, id: editingId } : c)));
      setEditingId(null);
    } else {
      setContacts((cs) => [...cs, { ...contact, id: Date.now() }]);
    }
    resetFields();
    setLinks([]);
  }

  function startEdit(contact) {
    setEditingId(contact.id);
    setFields({ ...contact });
    setErrors({});
    setLinks([]);
  }

  function cancelEdit() {
    setEditingId(null);
    resetFields();
    setErrors({});
  }

  function deleteContact(id) {
    setContacts((cs) => cs.filter((c) => c.id !== id));
    setLinks([]);
    if (editingId === id) cancelEdit();
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { alert("CSV is empty or has no data rows."); return; }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const numIdx = headers.indexOf("number");
      if (nameIdx === -1 || numIdx === -1) { alert("CSV must have 'name' and 'number' columns."); return; }
      const valid = [], invalid = [];
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",").map((c) => c.trim());
        const name = cols[nameIdx] || "";
        const number = cols[numIdx] || "";
        const digits = number.replace(/\D/g, "");
        if (!name) { invalid.push(`Row ${i + 2}: missing name`); return; }
        if (digits.length !== 10 && !(digits.startsWith("91") && digits.length === 12)) {
          invalid.push(`Row ${i + 2}: invalid number "${number}"`); return;
        }
        const extra = {};
        headers.forEach((h, idx) => { if (h !== "name" && h !== "number") extra[h] = cols[idx] || ""; });
        valid.push({ id: Date.now() + Math.random(), name, number, ...extra });
      });
      if (invalid.length > 0) alert(`Skipped rows:\n${invalid.join("\n")}`);
      if (valid.length > 0) { setContacts((cs) => [...cs, ...valid]); setLinks([]); }
      else alert("No valid contacts found.");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function sendMessages() {
    setLoading(true);
    setTimeout(() => {
      const generated = contacts.map((contact) => ({
        name: contact.name,
        url: `https://wa.me/${formatNumber(contact.number)}?text=${encodeURIComponent(personalise(template, contact))}`,
      }));
      setLinks(generated);
      setLoading(false);
    }, 800);
  }

  const preview = template.trim() && contacts.length > 0
    ? personalise(template, contacts[0])
    : null;

  const isDisabled = !template.trim() || contacts.length === 0;

  // ── render ──

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold">W</div>
            <span className="font-semibold text-gray-800 dark:text-white text-sm">Smart WA Sender</span>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base"
            title="Toggle dark mode"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* Step Bar */}
        <StepBar current={currentStep} />

        {/* 1 — Message Template */}
        <Card>
          <SectionTitle>Step 1 — Message Template</SectionTitle>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Use variables like <code className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded">{"{name}"}</code>, <code className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded">{"{order_id}"}</code>, <code className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded">{"{amount}"}</code>
          </label>
          <textarea
            className="w-full min-h-[96px] mt-1 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600
              bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-green-400 resize-y leading-relaxed transition"
            placeholder={"Hi {name}, your order {order_id} of ₹{amount} is confirmed!"}
            value={template}
            onChange={(e) => { setTemplate(e.target.value); setLinks([]); }}
          />
          {templateVars.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 items-center">
              <span className="text-xs text-gray-400 dark:text-gray-500">Detected:</span>
              {templateVars.map((v) => (
                <span key={v} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-mono">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* 2 — Add / Edit Contact */}
        <Card>
          <SectionTitle>{editingId ? "Edit Contact" : "Step 2 — Add Contact"}</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name *</label>
              <input
                className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-green-400 transition
                  ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-600"}`}
                placeholder="e.g. Rahul"
                value={fields.name || ""}
                onChange={(e) => setField("name", e.target.value)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone number *</label>
              <input
                className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-green-400 transition
                  ${errors.number ? "border-red-400" : "border-gray-200 dark:border-gray-600"}`}
                placeholder="10-digit number"
                value={fields.number || ""}
                maxLength={12}
                onChange={(e) => setField("number", e.target.value)}
              />
              {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
            </div>
          </div>

          {extraVars.length > 0 && (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 mt-1">Extra fields from template</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {extraVars.map((v) => (
                  <div key={v}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{v}</label>
                    <input
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                      placeholder={v === "amount" ? "e.g. 499" : v === "order_id" ? "e.g. ORD001" : `Enter ${v}`}
                      value={fields[v] || ""}
                      onChange={(e) => setField(v, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2 mt-1">
            {editingId
              ? <>
                  <PrimaryBtn onClick={addOrSave} className="flex-1">Save changes</PrimaryBtn>
                  <SecondaryBtn onClick={cancelEdit} className="flex-1">Cancel</SecondaryBtn>
                </>
              : <OutlineBtn onClick={addOrSave}>+ Add contact</OutlineBtn>
            }
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
            <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleCSV} />
            <button
              onClick={() => fileRef.current.click()}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border-2 border-dashed
                border-blue-300 dark:border-blue-700 text-blue-500 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              ⬆ Upload CSV (name, number, ...)
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              First row must be headers. Extra columns map to template variables.
            </p>
          </div>
        </Card>

        {/* 3 — Contact List */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Contacts</SectionTitle>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
              {contacts.length}
            </span>
          </div>

          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No contacts added yet</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add contacts above or upload a CSV</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Number</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide hidden sm:table-cell">Extra</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {contacts.map((c) => {
                    const extra = Object.entries(c).filter(([k]) => !["id", "name", "number"].includes(k));
                    return (
                      <tr key={c.id}
                        className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40
                          ${editingId === c.id ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}>
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{c.number}</td>
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs hidden sm:table-cell">
                          {extra.map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(c)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs">
                              ✏️
                            </button>
                            <button onClick={() => deleteContact(c.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* 4 — Preview */}
        <Card>
          <SectionTitle>Step 3 — Preview</SectionTitle>
          {preview ? (
            <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 text-center">
                Previewing for <span className="font-medium text-gray-600 dark:text-gray-300">{contacts[0]?.name}</span>
              </p>
              <ChatBubble message={preview} template={template} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No preview available</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                {!template.trim() ? "Write a message template first" : "Add at least one contact"}
              </p>
            </div>
          )}
        </Card>

        {/* 5 — Send */}
        <Card>
          <SectionTitle>Step 4 — Send</SectionTitle>
          <PrimaryBtn onClick={sendMessages} disabled={isDisabled} loading={loading}>
            Send messages →
          </PrimaryBtn>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
            Messages will open in WhatsApp. You must press send manually for each contact.
          </p>

          {links.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Open in WhatsApp</p>
              {links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl
                    bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
                    text-green-700 dark:text-green-400 font-medium text-sm
                    hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <span>Send to {link.name}</span>
                  <span className="text-green-500">→</span>
                </a>
              ))}
            </div>
          )}
        </Card>

      </main>
    </div>
  );
}