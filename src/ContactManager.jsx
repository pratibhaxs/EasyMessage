import { useState, useRef } from "react";
import { useApp } from "./AppContext";
import { Card, Label, Input, Select, PrimaryBtn, SecondaryBtn, GhostBtn, DangerGhostBtn, EmptyState, Badge } from "./ui";

function formatNumber(raw) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return "91" + d;
  if (d.startsWith("91") && d.length === 12) return d;
  return d;
}
function detectVars(t) {
  return [...new Set([...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}
function personalise(template, contact) {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    contact[k] !== undefined && contact[k] !== "" ? contact[k] : `{${k}}`
  );
}

export default function ContactManager({ activeTemplate, onLinksGenerated, links, onGoToTemplates }) {
  const { contacts, groups, createContact, editContact, removeContact } = useApp();
  const [fields, setFields] = useState({ name: "", number: "", group: "" });
  const [extraFields, setExtraFields] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef();

  const templateVars = activeTemplate
    ? detectVars(activeTemplate).filter((v) => v !== "name" && v !== "number")
    : [];

  function setField(k, v) { setFields((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); }

  function validate() {
    const errs = {};
    if (!fields.name.trim()) errs.name = "Required";
    const d = (fields.number || "").replace(/\D/g, "");
    if (!d) errs.number = "Required";
    else if (d.length !== 10 && !(d.startsWith("91") && d.length === 12)) errs.number = "Invalid number";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const data = { ...fields, ...extraFields, name: fields.name.trim(), number: fields.number.trim() };
      if (editingId) { await editContact(editingId, data); setEditingId(null); }
      else await createContact(data);
      setFields({ name: "", number: "", group: "" });
      setExtraFields({});
      setErrors({});
      setShowForm(false);
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  function startEdit(c) {
    setShowForm(true);
    setEditingId(c.id);
    const { id, createdAt, ...rest } = c;
    setFields({ name: rest.name || "", number: rest.number || "", group: rest.group || "" });
    const extra = {};
    Object.entries(rest).forEach(([k, v]) => { if (!["name", "number", "group"].includes(k)) extra[k] = v; });
    setExtraFields(extra);
    setErrors({});
  }

  function cancelEdit() {
    setEditingId(null);
    setFields({ name: "", number: "", group: "" });
    setExtraFields({});
    setErrors({});
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this contact?")) return;
    await removeContact(id);
    if (editingId === id) cancelEdit();
  }

  function handleCSV(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) { alert("CSV is empty."); return; }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const ni = headers.indexOf("name"), mi = headers.indexOf("number");
      if (ni === -1 || mi === -1) { alert("CSV needs 'name' and 'number' columns."); return; }
      const valid = [], invalid = [];
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(",").map((c) => c.trim());
        const name = cols[ni] || "", number = cols[mi] || "";
        const d = number.replace(/\D/g, "");
        if (!name) { invalid.push(`Row ${i + 2}: missing name`); return; }
        if (d.length !== 10 && !(d.startsWith("91") && d.length === 12)) { invalid.push(`Row ${i + 2}: invalid number`); return; }
        const extra = {};
        headers.forEach((h, idx) => { if (h !== "name" && h !== "number") extra[h] = cols[idx] || ""; });
        valid.push({ name, number, ...extra });
      });
      if (invalid.length) alert(`Skipped:\n${invalid.join("\n")}`);
      for (const c of valid) await createContact(c);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function generateLinks() {
    if (!activeTemplate) { alert("Select a template first from the Templates page."); return; }
    setSending(true);
    setTimeout(() => {
      onLinksGenerated(contacts.map((c) => ({
        name: c.name,
        url: `https://wa.me/${formatNumber(c.number)}?text=${encodeURIComponent(personalise(activeTemplate, c))}`,
      })));
      setSending(false);
    }, 400);
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main: table */}
        <div className="lg:col-span-2 space-y-3">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Contacts
              <span className="ml-2 text-[12px] font-normal text-zinc-400">{contacts.length}</span>
            </h1>
            <div className="flex items-center gap-2">
              <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleCSV} />
              <GhostBtn onClick={() => fileRef.current.click()}>↑ Import CSV</GhostBtn>
              <PrimaryBtn onClick={() => { setShowForm(true); setEditingId(null); setFields({ name: "", number: "", group: "" }); }}>
                + Add contact
              </PrimaryBtn>
            </div>
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <Card className="p-4">
              <Label>{editingId ? "Edit contact" : "New contact"}</Label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Name" placeholder="e.g. Rahul" value={fields.name}
                  onChange={(e) => setField("name", e.target.value)} error={errors.name} />
                <Input label="Phone" placeholder="10-digit" value={fields.number}
                  maxLength={12} onChange={(e) => setField("number", e.target.value)} error={errors.number} />
                <Select label="Group" value={fields.group} onChange={(e) => setField("group", e.target.value)}>
                  <option value="">No group</option>
                  {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
                </Select>
                {templateVars.map((v) => (
                  <Input key={v} label={v} placeholder={`Enter ${v}`}
                    value={extraFields[v] || ""} onChange={(e) => setExtraFields((f) => ({ ...f, [v]: e.target.value }))} />
                ))}
              </div>
              <div className="flex gap-2">
                <PrimaryBtn onClick={handleSubmit} loading={saving}>{editingId ? "Save" : "Add"}</PrimaryBtn>
                <SecondaryBtn onClick={cancelEdit}>Cancel</SecondaryBtn>
              </div>
            </Card>
          )}

          {/* Stripe-style table */}
          <Card className="overflow-hidden">
            {contacts.length === 0 ? (
              <EmptyState
                title="No contacts yet"
                action="+ Add your first contact"
                onAction={() => setShowForm(true)}
              />
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="w-8 px-4 py-2.5">
                        <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 w-3 h-3" disabled />
                      </th>
                      {["Name", "Number", "Group", ""].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest
                          text-zinc-400 dark:text-zinc-500 ${i === 3 ? "text-right pr-4" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                    {contacts.map((c) => (
                      <tr key={c.id}
                        className={`h-9 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group
                          ${editingId === c.id ? "bg-amber-50/40 dark:bg-amber-900/10" : ""}`}>
                        <td className="px-4">
                          <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" disabled />
                        </td>
                        <td className="px-3 py-0">
                          <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{c.name}</span>
                        </td>
                        <td className="px-3 py-0">
                          <span className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500">{c.number}</span>
                        </td>
                        <td className="px-3 py-0">
                          {c.group
                            ? <Badge color="blue">{c.group}</Badge>
                            : <span className="text-zinc-300 dark:text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-0 text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GhostBtn onClick={() => startEdit(c)}>Edit</GhostBtn>
                            <DangerGhostBtn onClick={() => handleDelete(c.id)}>×</DangerGhostBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Row count footer */}
                <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</span>
                  <PrimaryBtn onClick={generateLinks} loading={sending} disabled={!activeTemplate}>
                    {activeTemplate ? "Generate WhatsApp links →" : "Select a template first"}
                  </PrimaryBtn>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: preview + links */}
        <div className="space-y-3">

          {/* Template status */}
          <Card className="p-4">
            <Label>Active template</Label>
            {activeTemplate ? (
              <p className="text-[12px] text-zinc-600 dark:text-zinc-300 font-mono leading-relaxed line-clamp-3">
                {activeTemplate}
              </p>
            ) : (
              <div>
                <p className="text-[12px] text-zinc-400 mb-2">No template selected.</p>
                <button onClick={onGoToTemplates}
                  className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  Go to Templates →
                </button>
              </div>
            )}
          </Card>

          {/* WhatsApp links */}
          {links && links.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <Label className="mb-0">WhatsApp links</Label>
                <p className="text-[11px] text-zinc-400 mt-0.5">{links.length} ready to open</p>
              </div>
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60 max-h-60 overflow-y-auto">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-50
                      dark:hover:bg-zinc-800/50 group transition-colors">
                    <span className="text-[13px] text-zinc-600 dark:text-zinc-300 truncate">{link.name}</span>
                    <span className="text-[11px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                      Open ↗
                    </span>
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
