import { useState, useRef } from "react";

const PRIMARY = "#25D366";
const PRIMARY_DARK = "#128C7E";

const s = {
  page: { minHeight: "100vh", background: "#f4f6f8", padding: "24px 16px 48px", boxSizing: "border-box" },
  container: { maxWidth: 580, margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  appTitle: { fontSize: 22, fontWeight: 700, color: PRIMARY_DARK, marginBottom: 4 },
  appSub: { fontSize: 13, color: "#888", marginBottom: 24 },
  card: { background: "#fff", borderRadius: 12, padding: "20px 18px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 },
  label: { display: "block", fontSize: 12, color: "#777", marginBottom: 4, fontWeight: 500 },
  textarea: { width: "100%", minHeight: 90, padding: "10px 12px", fontSize: 15, border: "1.5px solid #e0e0e0", borderRadius: 8, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit", lineHeight: 1.5 },
  input: { width: "100%", padding: "11px 12px", fontSize: 15, border: "1.5px solid #e0e0e0", borderRadius: 8, boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
  inputError: { borderColor: "#e53935" },
  errorText: { fontSize: 11, color: "#e53935", marginTop: 3 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  field: { display: "flex", flexDirection: "column", marginBottom: 10 },
  addBtn: { width: "100%", padding: "12px 0", fontSize: 15, fontWeight: 600, background: "#fff", border: `2px solid ${PRIMARY}`, color: PRIMARY, borderRadius: 8, cursor: "pointer", marginTop: 4 },
  saveBtn: { width: "100%", padding: "12px 0", fontSize: 15, fontWeight: 600, background: "#1976D2", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", marginTop: 4 },
  cancelBtn: { width: "100%", padding: "11px 0", fontSize: 15, fontWeight: 500, background: "#fff", border: "1.5px solid #ccc", color: "#555", borderRadius: 8, cursor: "pointer", marginTop: 8 },
  contactItem: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", background: "#f9f9f9", borderRadius: 8, marginBottom: 8, gap: 8 },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 14, fontWeight: 600, color: "#222" },
  contactNum: { fontSize: 12, color: "#888", marginTop: 2 },
  contactExtra: { fontSize: 11, color: "#aaa", marginTop: 2 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 15, lineHeight: 1, flexShrink: 0 },
  empty: { fontSize: 13, color: "#bbb", textAlign: "center", padding: "14px 0" },
  previewBox: { background: "#e9fdf1", border: "1px solid #b2dfce", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#1a5c40", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  previewEmpty: { fontSize: 13, color: "#aaa", fontStyle: "italic" },
  sendBtn: { width: "100%", padding: "14px 0", fontSize: 16, fontWeight: 700, background: PRIMARY, border: "none", color: "#fff", borderRadius: 10, cursor: "pointer" },
  sendBtnDisabled: { background: "#ccc", cursor: "not-allowed" },
  hint: { textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 10, lineHeight: 1.5 },
  linkItem: { display: "block", padding: "12px 14px", marginBottom: 8, background: "#e9fdf1", border: `1px solid ${PRIMARY}`, borderRadius: 8, color: PRIMARY_DARK, fontWeight: 600, fontSize: 14, textDecoration: "none" },
  csvBtn: { width: "100%", padding: "11px 0", fontSize: 14, fontWeight: 500, background: "#f0f4ff", border: "1.5px dashed #90a4d4", color: "#3a5bbf", borderRadius: 8, cursor: "pointer", marginTop: 8 },
  tag: { display: "inline-block", background: "#e8f5e9", color: "#2e7d32", fontSize: 11, padding: "2px 7px", borderRadius: 10, marginRight: 4, marginTop: 3, fontFamily: "monospace" },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "12px 0" },
  detectedVars: { fontSize: 12, color: "#888", marginTop: 8 },
};

// ── helpers ──────────────────────────────────────────────────────────────────

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
  const matches = [...template.matchAll(/\{(\w+)\}/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

// ── component ─────────────────────────────────────────────────────────────────

export default function App() {
  const [template, setTemplate] = useState("");
  const [contacts, setContacts] = useState([]);
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [fields, setFields] = useState({ name: "", number: "" });

  const fileRef = useRef();

  const templateVars = detectVars(template);
  const extraVars = templateVars.filter((v) => v !== "name" && v !== "number");

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
    if (!digits) errs.number = "Phone number is required";
    else if (digits.length !== 10 && !(digits.startsWith("91") && digits.length === 12))
      errs.number = "Enter a valid 10-digit Indian number";
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

  // ── CSV upload ──

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

      if (nameIdx === -1 || numIdx === -1) {
        alert("CSV must have 'name' and 'number' columns in the first row.");
        return;
      }

      const valid = [];
      const invalid = [];

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
        headers.forEach((h, idx) => {
          if (h !== "name" && h !== "number") extra[h] = cols[idx] || "";
        });

        valid.push({ id: Date.now() + Math.random(), name, number, ...extra });
      });

      if (invalid.length > 0) alert(`Some rows were skipped:\n${invalid.join("\n")}`);
      if (valid.length > 0) { setContacts((cs) => [...cs, ...valid]); setLinks([]); }
      else alert("No valid contacts found in CSV.");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── send ──

  function sendMessages() {
    const generated = contacts.map((contact) => {
      const msg = personalise(template, contact);
      const num = formatNumber(contact.number);
      return { name: contact.name, url: `https://wa.me/${num}?text=${encodeURIComponent(msg)}` };
    });
    setLinks(generated);
  }

  const preview = template.trim() && contacts.length > 0
    ? personalise(template, contacts[0])
    : null;

  const isDisabled = !template.trim() || contacts.length === 0;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.appTitle}>EasyMessage</div>
        <div style={s.appSub}>Send personalised WhatsApp messages</div>

        {/* Template */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Message Template</div>
          <label style={s.label}>Use variables like {"{name}"}, {"{order_id}"}, {"{amount}"}</label>
          <textarea
            style={s.textarea}
            placeholder={"Hi {name}, your order {order_id} of ₹{amount} is ready!"}
            value={template}
            onChange={(e) => { setTemplate(e.target.value); setLinks([]); }}
          />
          {templateVars.length > 0 && (
            <div style={s.detectedVars}>
              Detected variables:&nbsp;
              {templateVars.map((v) => (
                <span key={v} style={s.tag}>{`{${v}}`}</span>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit */}
        <div style={s.card}>
          <div style={s.sectionTitle}>{editingId ? "Edit Contact" : "Add Contact"}</div>

          <div style={s.row2}>
            <div style={s.field}>
              <label style={s.label}>Name *</label>
              <input
                style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
                placeholder="e.g. Rahul"
                value={fields.name || ""}
                onChange={(e) => setField("name", e.target.value)}
              />
              {errors.name && <span style={s.errorText}>{errors.name}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone number *</label>
              <input
                style={{ ...s.input, ...(errors.number ? s.inputError : {}) }}
                placeholder="10-digit number"
                value={fields.number || ""}
                maxLength={12}
                onChange={(e) => setField("number", e.target.value)}
              />
              {errors.number && <span style={s.errorText}>{errors.number}</span>}
            </div>
          </div>

          {extraVars.length > 0 && (
            <>
              <div style={s.divider} />
              <div style={{ ...s.label, marginBottom: 10 }}>Extra fields detected from template</div>
              <div style={s.row2}>
                {extraVars.map((v) => (
                  <div key={v} style={s.field}>
                    <label style={s.label}>{v}</label>
                    <input
                      style={s.input}
                      placeholder={v === "amount" ? "e.g. 499" : v === "order_id" ? "e.g. ORD001" : `Enter ${v}`}
                      value={fields[v] || ""}
                      onChange={(e) => setField(v, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <button style={editingId ? s.saveBtn : s.addBtn} onClick={addOrSave}>
            {editingId ? "Save changes" : "+ Add contact"}
          </button>
          {editingId && <button style={s.cancelBtn} onClick={cancelEdit}>Cancel</button>}

          <div style={s.divider} />
          <input type="file" accept=".csv" ref={fileRef} style={{ display: "none" }} onChange={handleCSV} />
          <button style={s.csvBtn} onClick={() => fileRef.current.click()}>
            ⬆ Upload CSV (name, number, order_id, amount ...)
          </button>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
            First row must be headers. Extra columns map to template variables automatically.
          </div>
        </div>

        {/* Contact List */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Contacts ({contacts.length})</div>
          {contacts.length === 0 ? (
            <div style={s.empty}>No contacts added yet</div>
          ) : contacts.map((c) => {
            const extra = Object.entries(c).filter(([k]) => !["id", "name", "number"].includes(k));
            return (
              <div key={c.id} style={{
                ...s.contactItem,
                background: editingId === c.id ? "#fff8e1" : "#f9f9f9",
                border: editingId === c.id ? "1.5px solid #FFC107" : "1.5px solid transparent",
              }}>
                <div style={s.contactInfo}>
                  <div style={s.contactName}>{c.name}</div>
                  <div style={s.contactNum}>{c.number}</div>
                  {extra.length > 0 && (
                    <div style={s.contactExtra}>
                      {extra.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                    </div>
                  )}
                </div>
                <button style={{ ...s.iconBtn, color: "#1976D2" }} onClick={() => startEdit(c)}>✏️</button>
                <button style={{ ...s.iconBtn, color: "#e53935" }} onClick={() => deleteContact(c.id)}>🗑️</button>
              </div>
            );
          })}
        </div>

        {/* Preview */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Preview</div>
          <div style={{ ...s.label, marginBottom: 8 }}>
            Message for {contacts[0]?.name || "first contact"}
          </div>
          <div style={s.previewBox}>
            {preview
              ? preview
              : <span style={s.previewEmpty}>
                  {!template.trim()
                    ? "Write a message template above to see preview"
                    : "Add a contact to see preview"}
                </span>
            }
          </div>
        </div>

        {/* Send Button */}
        <button
          style={{ ...s.sendBtn, ...(isDisabled ? s.sendBtnDisabled : {}) }}
          onClick={sendMessages}
          disabled={isDisabled}
        >
          Send messages →
        </button>
        <p style={s.hint}>
          Messages will open in WhatsApp.{"\n"}You must press send manually for each contact.
        </p>

        {/* WhatsApp Links */}
        {links.length > 0 && (
          <div style={{ ...s.card, marginTop: 16 }}>
            <div style={s.sectionTitle}>Open in WhatsApp</div>
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer" style={s.linkItem}>
                Send to {link.name} →
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}