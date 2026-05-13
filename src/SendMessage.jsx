import { useState } from "react";
import { useApp } from "./AppContext";
import { Card, Label, Input, Textarea, Select, PrimaryBtn, SecondaryBtn, SegmentedControl, Badge } from "./ui";

function formatNumber(raw) {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return "91" + d;
  if (d.startsWith("91") && d.length === 12) return d;
  return d;
}
function generateMessage(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    data[k] !== undefined && data[k] !== "" ? data[k] : `{${k}}`
  );
}
function detectVars(t) {
  return [...new Set([...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}
function isValidNumber(raw) {
  const d = raw.replace(/\D/g, "");
  return d.length === 10 || (d.startsWith("91") && d.length === 12);
}

// ── Vertical step indicator (Linear-style) ────────────────────────────────────
function Step({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 transition-colors
        ${done ? "bg-emerald-500 text-white" : active ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
        {done ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : number}
      </div>
      <span className={`text-[13px] font-medium ${active ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`}>
        {label}
      </span>
    </div>
  );
}

export default function SendMessage() {
  const { contacts, templates } = useApp();
  const [mode, setMode] = useState("contact");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [extraFields, setExtraFields] = useState({});
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const templateVars = detectVars(messageTemplate).filter((v) => v !== "name" && v !== "number");
  const allData = { name, number, ...extraFields };
  const finalMessage = messageTemplate ? generateMessage(messageTemplate, allData) : "";
  const isValid = name.trim() && number.trim() && isValidNumber(number) && messageTemplate.trim();

  // step progress
  const step1Done = mode === "manual"
    ? !!messageTemplate.trim()
    : !!(selectedContactId || (name && number)) && !!messageTemplate.trim();
  const step2Done = !!(name.trim() && number.trim() && isValidNumber(number));
  const step3Done = !!finalMessage;

  function handleContactSelect(id) {
    setSelectedContactId(id); setSent(false);
    if (!id) { setName(""); setNumber(""); setExtraFields({}); return; }
    const c = contacts.find((c) => c.id === id);
    if (!c) return;
    setName(c.name || ""); setNumber(c.number || "");
    const extra = {};
    Object.entries(c).forEach(([k, v]) => {
      if (!["id", "name", "number", "group", "createdAt"].includes(k)) extra[k] = v;
    });
    setExtraFields(extra);
    setErrors({});
  }

  function handleTemplateSelect(id) {
    setSelectedTemplateId(id); setSent(false);
    if (!id) { setMessageTemplate(""); return; }
    const t = templates.find((t) => t.id === id);
    if (t) setMessageTemplate(t.text);
    setErrors((e) => ({ ...e, message: "" }));
  }

  function handleSend() {
    const errs = {};
    if (!name.trim()) errs.name = "Required";
    if (!number.trim() || !isValidNumber(number)) errs.number = "Enter a valid 10-digit number";
    if (!messageTemplate.trim()) errs.message = "Required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    window.open(`https://wa.me/${formatNumber(number)}?text=${encodeURIComponent(finalMessage)}`, "_blank");
    setSent(true);
  }

  function handleReset() {
    setName(""); setNumber(""); setMessageTemplate(""); setExtraFields({});
    setSelectedContactId(""); setSelectedTemplateId("");
    setErrors({}); setSent(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page title */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Send message</h1>
          <p className="text-[12px] text-zinc-400 mt-0.5">Open a personalised WhatsApp chat instantly</p>
        </div>
        <SegmentedControl
          options={[{ value: "contact", label: "Saved contact" }, { value: "manual", label: "Manual" }]}
          value={mode}
          onChange={(v) => { setMode(v); handleReset(); }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: steps (3 cols) */}
        <div className="lg:col-span-3 space-y-px">

          {/* Step 1 */}
          <Card className="p-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Step number="1" label="Choose source" active={true} done={step1Done} />
            </div>
            <div className="space-y-3 pl-[30px]">
              {mode === "contact" && (
                <Select label="Contact" value={selectedContactId}
                  onChange={(e) => handleContactSelect(e.target.value)}>
                  <option value="">— Select a contact —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} · {c.number}</option>
                  ))}
                </Select>
              )}
              <Select label="Template" value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}>
                <option value="">— Select a template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.text.length > 60 ? t.text.slice(0, 60) + "…" : t.text}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="p-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Step number="2" label="Fill in details" active={step1Done} done={step2Done && step1Done} />
            </div>
            <div className="pl-[30px] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Name" placeholder="e.g. Rahul" value={name}
                  onChange={(e) => { setName(e.target.value); setSelectedContactId(""); setErrors((er) => ({ ...er, name: "" })); setSent(false); }}
                  error={errors.name} />
                <Input label="Phone" placeholder="10-digit" value={number} maxLength={12}
                  onChange={(e) => { setNumber(e.target.value); setSelectedContactId(""); setErrors((er) => ({ ...er, number: "" })); setSent(false); }}
                  error={errors.number} />
              </div>
              {templateVars.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {templateVars.map((v) => (
                    <Input key={v} label={v} placeholder={`Enter ${v}`}
                      value={extraFields[v] || ""}
                      onChange={(e) => setExtraFields((f) => ({ ...f, [v]: e.target.value }))} />
                  ))}
                </div>
              )}
              <Textarea label="Message" placeholder={"Hi {name}, your order is ready!"}
                value={messageTemplate}
                onChange={(e) => { setMessageTemplate(e.target.value); setSelectedTemplateId(""); setErrors((er) => ({ ...er, message: "" })); setSent(false); }}
                error={errors.message} className="min-h-[60px] text-[13px]" />
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <Step number="3" label="Send" active={step2Done} done={sent} />
            </div>
            <div className="pl-[30px]">
              {sent && (
                <div className="mb-3 flex items-center gap-2 text-[12px] text-emerald-600 dark:text-emerald-400
                  bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800
                  rounded-md px-3 py-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  WhatsApp opened — press Send inside the app.
                </div>
              )}
              <div className="flex items-center gap-2">
                <PrimaryBtn onClick={handleSend} disabled={!isValid}>Open in WhatsApp →</PrimaryBtn>
                <SecondaryBtn onClick={handleReset}>Reset</SecondaryBtn>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">You must press send manually in WhatsApp.</p>
            </div>
          </Card>
        </div>

        {/* Right: preview panel (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Stripe-style preview panel */}
          <Card>
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <Label className="mb-0">Preview</Label>
              {name && <p className="text-[12px] text-zinc-400 mt-0.5">To {name}{number ? ` · ${number}` : ""}</p>}
            </div>
            <div className="p-4">
              {finalMessage ? (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex justify-end">
                    <div className="max-w-[90%] bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-3 py-2">
                      <p className="text-[12px] leading-relaxed whitespace-pre-wrap">{finalMessage}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-emerald-100 opacity-70">
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-emerald-100 opacity-70">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 px-4 py-8 text-center">
                  <p className="text-[12px] text-zinc-400">
                    {!messageTemplate ? "Select or write a template" : "Fill in name to preview"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick stats */}
          <Card className="p-4">
            <Label>Available</Label>
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400">Contacts</span>
                <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400">Templates</span>
                <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">{templates.length}</span>
              </div>
            </div>
            {(contacts.length === 0 || templates.length === 0) && (
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                {contacts.length === 0 && (
                  <p className="text-[11px] text-zinc-400">No contacts — go to <strong className="text-zinc-500">Contacts</strong> to add some.</p>
                )}
                {templates.length === 0 && (
                  <p className="text-[11px] text-zinc-400">No templates — go to <strong className="text-zinc-500">Templates</strong> to create one.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
