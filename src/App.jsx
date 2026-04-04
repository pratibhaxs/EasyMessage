import { useState } from "react";

const PRIMARY = "#25D366";
const PRIMARY_DARK = "#128C7E";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "24px 16px 48px",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 560,
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: PRIMARY_DARK,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 13,
    color: "#888",
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 18px",
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 12,
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
    fontWeight: 500,
  },
  textarea: {
    width: "100%",
    minHeight: 90,
    padding: "10px 12px",
    fontSize: 15,
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: 1.5,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },
  rowMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    marginBottom: 10,
  },
  field: { display: "flex", flexDirection: "column" },
  input: {
    width: "100%",
    padding: "11px 12px",
    fontSize: 15,
    border: "1.5px solid #e0e0e0",
    borderRadius: 8,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "#e53935",
  },
  errorText: {
    fontSize: 11,
    color: "#e53935",
    marginTop: 3,
  },
  addBtn: {
    width: "100%",
    padding: "12px 0",
    fontSize: 15,
    fontWeight: 600,
    background: "#fff",
    border: `2px solid ${PRIMARY}`,
    color: PRIMARY,
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 4,
  },
  contactItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#222",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  contactNum: { fontSize: 12, color: "#888", marginTop: 2 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: 6,
    fontSize: 15,
    lineHeight: 1,
    flexShrink: 0,
  },
  editBtn: { color: "#1976D2" },
  deleteBtn: { color: "#e53935" },
  saveBtn: {
    width: "100%",
    padding: "12px 0",
    fontSize: 15,
    fontWeight: 600,
    background: "#1976D2",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 4,
  },
  cancelBtn: {
    width: "100%",
    padding: "11px 0",
    fontSize: 15,
    fontWeight: 500,
    background: "#fff",
    border: "1.5px solid #ccc",
    color: "#555",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 8,
  },
  empty: {
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
    padding: "14px 0",
  },
  previewBox: {
    background: "#e9fdf1",
    border: "1px solid #b2dfce",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
    color: "#1a5c40",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  previewEmpty: {
    fontSize: 13,
    color: "#aaa",
    fontStyle: "italic",
  },
  sendBtn: {
    width: "100%",
    padding: "14px 0",
    fontSize: 16,
    fontWeight: 700,
    background: PRIMARY,
    border: "none",
    color: "#fff",
    borderRadius: 10,
    cursor: "pointer",
  },
  sendBtnDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: "#aaa",
    marginTop: 10,
    lineHeight: 1.5,
  },
  linkItem: {
    display: "block",
    padding: "12px 14px",
    marginBottom: 8,
    background: "#e9fdf1",
    border: `1px solid ${PRIMARY}`,
    borderRadius: 8,
    color: PRIMARY_DARK,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
  },
};

function formatNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export default function App() {
  const [template, setTemplate] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [contacts, setContacts] = useState([]);
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMobile] = useState(() => window.innerWidth < 500);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    const digits = number.replace(/\D/g, "");
    if (!digits) errs.number = "Phone number is required";
    else if (digits.length !== 10 && !(digits.startsWith("91") && digits.length === 12))
      errs.number = "Enter a valid 10-digit Indian number";
    return errs;
  }

  function addOrSaveContact() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    if (editingId !== null) {
      setContacts(contacts.map((c) =>
        c.id === editingId ? { ...c, name: name.trim(), number: number.trim() } : c
      ));
      setEditingId(null);
    } else {
      setContacts([...contacts, { id: Date.now(), name: name.trim(), number: number.trim() }]);
    }
    setName("");
    setNumber("");
    setLinks([]);
  }

  function startEdit(contact) {
    setEditingId(contact.id);
    setName(contact.name);
    setNumber(contact.number);
    setErrors({});
    setLinks([]);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setNumber("");
    setErrors({});
  }

  function deleteContact(id) {
    setContacts(contacts.filter((c) => c.id !== id));
    setLinks([]);
    if (editingId === id) cancelEdit();
  }

  function sendMessages() {
    const generated = contacts.map((contact) => {
      const personalised = template.replace(/\{name\}/g, contact.name);
      const num = formatNumber(contact.number);
      return {
        name: contact.name,
        url: `https://wa.me/${num}?text=${encodeURIComponent(personalised)}`,
      };
    });
    setLinks(generated);
  }

  const isDisabled = !template.trim() || contacts.length === 0;

  const preview = (() => {
    if (!template.trim() || contacts.length === 0) return null;
    return template.replace(/\{name\}/g, contacts[0].name);
  })();

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.appTitle}>EasyMessage</div>
        <div style={s.appSub}>Send personalised WhatsApp messages</div>

        {/* Message Template */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Message</div>
          <label style={s.label}>Template</label>
          <textarea
            style={s.textarea}
            placeholder="Write message using {name}&#10;e.g. Hi {name}, check out our latest offer!"
            value={template}
            onChange={(e) => { setTemplate(e.target.value); setLinks([]); }}
          />
        </div>

        {/* Add / Edit Contact */}
        <div style={s.card}>
          <div style={s.sectionTitle}>{editingId ? "Edit Contact" : "Add Contact"}</div>
          <div style={isMobile ? s.rowMobile : s.row}>
            <div style={s.field}>
              <label style={s.label}>Name</label>
              <input
                style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
                placeholder="e.g. Priya"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              />
              {errors.name && <span style={s.errorText}>{errors.name}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone number (10 digits)</label>
              <input
                style={{ ...s.input, ...(errors.number ? s.inputError : {}) }}
                placeholder="e.g. 9876543210"
                value={number}
                onChange={(e) => { setNumber(e.target.value); setErrors((p) => ({ ...p, number: "" })); }}
                maxLength={12}
              />
              {errors.number && <span style={s.errorText}>{errors.number}</span>}
            </div>
          </div>

          <button style={editingId ? s.saveBtn : s.addBtn} onClick={addOrSaveContact}>
            {editingId ? "Save changes" : "+ Add contact"}
          </button>
          {editingId && (
            <button style={s.cancelBtn} onClick={cancelEdit}>Cancel</button>
          )}
        </div>

        {/* Contact List */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Contacts ({contacts.length})</div>
          {contacts.length === 0 ? (
            <div style={s.empty}>No contacts added yet</div>
          ) : (
            contacts.map((c) => (
              <div key={c.id} style={{
                ...s.contactItem,
                background: editingId === c.id ? "#fff8e1" : "#f9f9f9",
                border: editingId === c.id ? "1.5px solid #FFC107" : "1.5px solid transparent",
              }}>
                <div style={s.contactInfo}>
                  <div style={s.contactName}>{c.name}</div>
                  <div style={s.contactNum}>{c.number}</div>
                </div>
                <button style={{ ...s.iconBtn, ...s.editBtn }} onClick={() => startEdit(c)} title="Edit">✏️</button>
                <button style={{ ...s.iconBtn, ...s.deleteBtn }} onClick={() => deleteContact(c.id)} title="Delete">🗑️</button>
              </div>
            ))
          )}
        </div>

        {/* Preview */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Preview</div>
          <div style={s.label} >How your message will look for {contacts[0]?.name || "first contact"}</div>
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

        {/* Send */}
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

        {/* Generated Links */}
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