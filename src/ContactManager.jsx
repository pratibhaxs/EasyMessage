import { useState, useRef } from "react";
import { useApp } from "./AppContext";
import { Card, SectionTitle, PrimaryBtn, SecondaryBtn, DangerBtn, OutlineBtn, Input, Select, EmptyState, Badge } from "./ui";

function formatNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

function detectVars(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}

function personalise(template, contact) {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    contact[k] !== undefined && contact[k] !== "" ? contact[k] : `{${k}}`
  );
}

export default function ContactManager({ activeTemplate, onLinksGenerated }) {
  const { contacts, groups, createContact, editContact, removeContact } = useApp();
  const [fields, setFields] = useState({ name: "", number: "", group: "" });
  const [extraFields, setExtraFields] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef();

  const templateVars = activeTemplate ? detectVars(activeTemplate).filter(v => v !== "name" && v !== "number") : [];

  function setField(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
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

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const data = { ...fields, ...extraFields, name: fields.name.trim(), number: fields.number.trim() };
      if (editingId) {
        await editContact(editingId, data);
        setEditingId(null);
      } else {
        await createContact(data);
      }
      setFields({ name: "", number: "", group: "" });
      setExtraFields({});
      setErrors({});
    } catch (e) { alert("Error saving contact: " + e.message); }
    finally { setSaving(false); }
  }

  function startEdit(c) {
    setEditingId(c.id);
    const { id, createdAt, ...rest } = c;
    const base = { name: rest.name || "", number: rest.number || "", group: rest.group || "" };
    const extra = {};
    Object.entries(rest).forEach(([k, v]) => {
      if (!["name", "number", "group"].includes(k)) extra[k] = v;
    });
    setFields(base);
    setExtraFields(extra);
    setErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setFields({ name: "", number: "", group: "" });
    setExtraFields({});
    setErrors({});
  }

  async function handleDelete(id) {
    if (!confirm("Delete this contact?")) return;
    await removeContact(id);
    if (editingId === id) cancelEdit();
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) { alert("CSV is empty."); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name"), numIdx = headers.indexOf("number");
      if (nameIdx === -1 || numIdx === -1) { alert("CSV must have 'name' and 'number' columns."); return; }
      const valid = [], invalid = [];
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",").map(c => c.trim());
        const name = cols[nameIdx] || "", number = cols[numIdx] || "";
        const digits = number.replace(/\D/g, "");
        if (!name) { invalid.push(`Row ${i + 2}: missing name`); return; }
        if (digits.length !== 10 && !(digits.startsWith("91") && digits.length === 12)) {
          invalid.push(`Row ${i + 2}: invalid number`); return;
        }
        const extra = {};
        headers.forEach((h, idx) => { if (h !== "name" && h !== "number") extra[h] = cols[idx] || ""; });
        valid.push({ name, number, ...extra });
      });
      if (invalid.length > 0) alert(`Skipped:\n${invalid.join("\n")}`);
      for (const c of valid) await createContact(c);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function generateLinks() {
    if (!activeTemplate) { alert("Please select or write a template first."); return; }
    setSending(true);
    setTimeout(() => {
      const links = contacts.map(c => ({
        name: c.name,
        url: `https://wa.me/${formatNumber(c.number)}?text=${encodeURIComponent(personalise(activeTemplate, c))}`,
      }));
      onLinksGenerated(links);
      setSending(false);
    }, 600);
  }

  return (
    <div className="space-y-4">
      {/* Form */}
      <Card>
        <SectionTitle>{editingId ? "Edit Contact" : "Add Contact"}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Input label="Name *" placeholder="e.g. Rahul" value={fields.name}
            onChange={e => setField("name", e.target.value)} error={errors.name} />
          <Input label="Phone number *" placeholder="10-digit number" value={fields.number}
            maxLength={12} onChange={e => setField("number", e.target.value)} error={errors.number} />
          <Select label="Group (optional)" value={fields.group} onChange={e => setField("group", e.target.value)}>
            <option value="">No group</option>
            {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </Select>
          {templateVars.map(v => (
            <Input key={v} label={v} placeholder={`Enter ${v}`}
              value={extraFields[v] || ""}
              onChange={e => setExtraFields(f => ({ ...f, [v]: e.target.value }))} />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {editingId
            ? <>
                <PrimaryBtn onClick={handleSubmit} loading={saving}>Save changes</PrimaryBtn>
                <SecondaryBtn onClick={cancelEdit}>Cancel</SecondaryBtn>
              </>
            : <PrimaryBtn onClick={handleSubmit} loading={saving}>+ Add contact</PrimaryBtn>
          }
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4">
          <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current.click()}
            className="w-full py-2.5 rounded-xl text-sm font-medium border-2 border-dashed
              border-blue-300 dark:border-blue-700 text-blue-500 hover:bg-blue-50
              dark:hover:bg-blue-900/20 transition-colors">
            ⬆ Upload CSV
          </button>
          <p className="text-center text-xs text-gray-400 mt-1.5">
            Headers: name, number, group, + any template variables
          </p>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="mb-0">Contacts</SectionTitle>
          <Badge color="green">{contacts.length}</Badge>
        </div>
        {contacts.length === 0
          ? <EmptyState icon="👥" title="No contacts yet" subtitle="Add contacts above or upload a CSV" />
          : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
                    {["Name", "Number", "Group", "Actions"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide
                        last:text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {contacts.map(c => (
                    <tr key={c.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors
                        ${editingId === c.id ? "bg-amber-50 dark:bg-amber-900/10" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{c.number}</td>
                      <td className="px-4 py-3">
                        {c.group ? <Badge color="blue">{c.group}</Badge> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(c)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-xs">✏️</button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {contacts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <PrimaryBtn onClick={generateLinks} loading={sending} className="w-full justify-center">
              Generate WhatsApp links →
            </PrimaryBtn>
            <p className="text-center text-xs text-gray-400 mt-2">You must press send manually in WhatsApp for each contact.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
