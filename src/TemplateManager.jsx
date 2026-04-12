import { useState } from "react";
import { useApp } from "./AppContext";
import { Card, SectionTitle, PrimaryBtn, SecondaryBtn, Textarea, EmptyState, Badge } from "./ui";

function detectVars(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map(m => m[1]))];
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
    try {
      await createTemplate(text.trim());
      setText("");
    } catch (e) { alert("Error saving: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id) {
    if (!editText.trim()) return;
    await editTemplate(id, editText.trim());
    setEditingId(null);
    setEditText("");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this template?")) return;
    await removeTemplate(id);
  }

  return (
    <Card>
      <SectionTitle>Message Templates</SectionTitle>

      {/* New template */}
      <div className="mb-4">
        <Textarea
          label="New template"
          placeholder={"Hi {name}, your order {order_id} of ₹{amount} is ready!"}
          value={text}
          onChange={e => setText(e.target.value)}
          className="min-h-[80px]"
        />
        {text.trim() && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-gray-400">Variables:</span>
            {detectVars(text).map(v => (
              <span key={v} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-mono">
                {`{${v}}`}
              </span>
            ))}
          </div>
        )}
        <PrimaryBtn onClick={handleSave} loading={saving} disabled={!text.trim()} className="mt-2">
          💾 Save template
        </PrimaryBtn>
      </div>

      {/* Template list */}
      {templates.length === 0
        ? <EmptyState icon="📝" title="No templates yet" subtitle="Save a template above to reuse it" />
        : (
          <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Saved templates — click to use</p>
            {templates.map(t => (
              <div key={t.id}
                className={`group rounded-xl border transition-all cursor-pointer
                  ${activeTemplateId === t.id
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-green-300"}`}>

                {editingId === t.id ? (
                  <div className="p-3">
                    <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="min-h-[70px] mb-2" />
                    <div className="flex gap-2">
                      <PrimaryBtn onClick={() => handleUpdate(t.id)} className="text-xs py-1.5 px-3">Save</PrimaryBtn>
                      <SecondaryBtn onClick={() => setEditingId(null)} className="text-xs py-1.5 px-3">Cancel</SecondaryBtn>
                    </div>
                  </div>
                ) : (
                  <div className="p-3" onClick={() => onSelect(t)}>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-2">
                      {t.text.length > 100 ? t.text.slice(0, 100) + "…" : t.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {detectVars(t.text).map(v => (
                          <span key={v} className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-mono">
                            {`{${v}}`}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditingId(t.id); setEditText(t.text); }}
                          className="p-1 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs">✏️</button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">🗑️</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </Card>
  );
}
