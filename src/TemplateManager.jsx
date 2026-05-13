import { useState } from "react";
import { useApp } from "./AppContext";
import { Card, Label, Textarea, PrimaryBtn, SecondaryBtn, GhostBtn, DangerGhostBtn, EmptyState, Divider } from "./ui";

function detectVars(t) {
  return [...new Set([...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}

export default function TemplateManager({ onSelect, activeTemplateId }) {
  const { templates, createTemplate, editTemplate, removeTemplate } = useApp();
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try { await createTemplate(text.trim()); setText(""); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id) {
    if (!editText.trim()) return;
    await editTemplate(id, editText.trim());
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this template?")) return;
    await removeTemplate(id);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main: templates */}
        <div className="lg:col-span-2 space-y-3">
          <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Templates</h1>

          {/* New template composer */}
          <Card className="p-4">
            <Label>New template</Label>
            <Textarea
              placeholder={"Hi {name}, your order {order_id} of ₹{amount} is confirmed!"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-[13px] min-h-[64px]"
            />
            {text.trim() && detectVars(text).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 items-center">
                <span className="text-[11px] text-zinc-400">Variables:</span>
                {detectVars(text).map((v) => (
                  <code key={v} className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                    {`{${v}}`}
                  </code>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <PrimaryBtn onClick={handleSave} loading={saving} disabled={!text.trim()}>
                Save template
              </PrimaryBtn>
              {text.trim() && (
                <GhostBtn onClick={() => setText("")}>Clear</GhostBtn>
              )}
            </div>
          </Card>

          {/* Saved templates — Notion-style list */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <Label className="mb-0">Saved templates</Label>
              <p className="text-[11px] text-zinc-400 mt-0.5">Click to activate for bulk send</p>
            </div>

            {templates.length === 0 ? (
              <EmptyState title="No templates yet · Save one above" />
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                {templates.map((t) => (
                  <div key={t.id}
                    onClick={() => !editingId && onSelect(t)}
                    className={`group px-4 py-3 cursor-pointer transition-colors
                      ${activeTemplateId === t.id
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-400"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border-l-2 border-transparent"}`}>

                    {editingId === t.id ? (
                      <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                        <Textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                          className="text-[13px] min-h-[56px]" />
                        <div className="flex gap-2">
                          <PrimaryBtn onClick={() => handleUpdate(t.id)}>Save</PrimaryBtn>
                          <SecondaryBtn onClick={() => setEditingId(null)}>Cancel</SecondaryBtn>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-mono leading-relaxed line-clamp-2">
                            {t.text}
                          </p>
                          {detectVars(t.text).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {detectVars(t.text).map((v) => (
                                <code key={v} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1 rounded font-mono">
                                  {`{${v}}`}
                                </code>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}>
                          <GhostBtn onClick={() => { setEditingId(t.id); setEditText(t.text); }}>Edit</GhostBtn>
                          <DangerGhostBtn onClick={() => handleDelete(t.id)}>×</DangerGhostBtn>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: variable reference */}
        <div className="space-y-3">
          <Card className="p-4">
            <Label>Variable guide</Label>
            <div className="space-y-2 mt-1">
              {[
                ["{name}", "Contact name"],
                ["{number}", "Phone number"],
                ["{amount}", "Amount / price"],
                ["{order_id}", "Order ID"],
                ["{date}", "Any date"],
              ].map(([v, d]) => (
                <div key={v} className="flex items-center justify-between gap-2">
                  <code className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
                    {v}
                  </code>
                  <span className="text-[11px] text-zinc-400 text-right">{d}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <Label>Stats</Label>
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500">Saved</span>
                <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">{templates.length}</span>
              </div>
              {activeTemplateId && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Template active</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <Label>How to use</Label>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Click any saved template to activate it. Then go to <strong className="text-zinc-500">Contacts</strong> to generate personalised WhatsApp links for all contacts at once.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
