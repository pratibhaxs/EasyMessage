import { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { Card, SectionTitle, Input, Textarea, Select, PrimaryBtn, SecondaryBtn, Badge } from "./ui";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

function generateMessage(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    data[key] !== undefined && data[key] !== "" ? data[key] : `{${key}}`
  );
}

function detectVars(template) {
  return [...new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))];
}

function isValidNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 || (digits.startsWith("91") && digits.length === 12);
}

// ── chat bubble ───────────────────────────────────────────────────────────────

function ChatBubble({ message }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[85%] bg-green-100 dark:bg-green-900/50 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
        <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1.5">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-green-500 text-xs">✓✓</span>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SendMessage() {
  const { contacts, templates } = useApp();

  // form state
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [extraFields, setExtraFields] = useState({});

  // selection state
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState("contact"); // "contact" | "manual"

  // derived
  const templateVars = detectVars(messageTemplate).filter(
    (v) => v !== "name" && v !== "number"
  );

  const allData = { name, number, ...extraFields };
  const finalMessage = messageTemplate ? generateMessage(messageTemplate, allData) : "";

  // ── handlers ──

  function handleContactSelect(id) {
    setSelectedContactId(id);
    setSent(false);
    if (!id) {
      setName("");
      setNumber("");
      setExtraFields({});
      return;
    }
    const c = contacts.find((c) => c.id === id);
    if (!c) return;
    setName(c.name || "");
    setNumber(c.number || "");
    const extra = {};
    Object.entries(c).forEach(([k, v]) => {
      if (!["id", "name", "number", "group", "createdAt"].includes(k)) extra[k] = v;
    });
    setExtraFields(extra);
    setErrors({});
  }

  function handleTemplateSelect(id) {
    setSelectedTemplateId(id);
    setSent(false);
    if (!id) { setMessageTemplate(""); return; }
    const t = templates.find((t) => t.id === id);
    if (t) setMessageTemplate(t.text);
    setErrors((e) => ({ ...e, message: "" }));
  }

  function handleNameChange(val) {
    setName(val);
    setSelectedContactId("");
    setErrors((e) => ({ ...e, name: "" }));
    setSent(false);
  }

  function handleNumberChange(val) {
    setNumber(val);
    setSelectedContactId("");
    setErrors((e) => ({ ...e, number: "" }));
    setSent(false);
  }

  function handleMessageChange(val) {
    setMessageTemplate(val);
    setSelectedTemplateId("");
    setErrors((e) => ({ ...e, message: "" }));
    setSent(false);
  }

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!number.trim()) errs.number = "Number is required";
    else if (!isValidNumber(number)) errs.number = "Enter a valid 10-digit Indian number";
    if (!messageTemplate.trim()) errs.message = "Message cannot be empty";
    return errs;
  }

  function handleSend() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const num = formatNumber(number);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, "_blank");
    setSent(true);
  }

  function handleReset() {
    setName("");
    setNumber("");
    setMessageTemplate("");
    setExtraFields({});
    setSelectedContactId("");
    setSelectedTemplateId("");
    setErrors({});
    setSent(false);
  }

  const isValid = name.trim() && number.trim() && isValidNumber(number) && messageTemplate.trim();

  // ── render ──

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* Mode toggle */}
      <Card>
        <SectionTitle>Send a Message</SectionTitle>
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-1">
          {[
            { key: "contact", label: "From saved contacts" },
            { key: "manual", label: "Manual entry" },
          ].map((m) => (
            <button key={m.key} onClick={() => { setMode(m.key); handleReset(); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all
                ${mode === m.key
                  ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Contact + Template selection */}
      <Card>
        <SectionTitle>
          {mode === "contact" ? "Select Contact & Template" : "Template"}
        </SectionTitle>

        <div className="space-y-3">
          {/* Contact dropdown (contact mode only) */}
          {mode === "contact" && (
            <Select
              label="Contact"
              value={selectedContactId}
              onChange={(e) => handleContactSelect(e.target.value)}
            >
              <option value="">— Choose a contact —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.number}
                </option>
              ))}
            </Select>
          )}

          {/* Template dropdown */}
          <Select
            label="Template"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
          >
            <option value="">— Choose a template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.text.length > 60 ? t.text.slice(0, 60) + "…" : t.text}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Message fields */}
      <Card>
        <SectionTitle>Message Details</SectionTitle>
        <div className="space-y-3">

          {/* Name */}
          <Input
            label="Name"
            placeholder="e.g. Rahul"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={errors.name}
          />

          {/* Number */}
          <Input
            label="Phone number"
            placeholder="10-digit number"
            value={number}
            maxLength={12}
            onChange={(e) => handleNumberChange(e.target.value)}
            error={errors.number}
          />

          {/* Extra template vars */}
          {templateVars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templateVars.map((v) => (
                <Input
                  key={v}
                  label={v}
                  placeholder={`Enter ${v}`}
                  value={extraFields[v] || ""}
                  onChange={(e) =>
                    setExtraFields((f) => ({ ...f, [v]: e.target.value }))
                  }
                />
              ))}
            </div>
          )}

          {/* Message textarea */}
          <Textarea
            label="Message"
            placeholder={"Hi {name}, your order is ready!"}
            value={messageTemplate}
            onChange={(e) => handleMessageChange(e.target.value)}
            error={errors.message}
            className="min-h-[100px]"
          />

          {/* Detected variables */}
          {templateVars.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-gray-400">Variables:</span>
              {detectVars(messageTemplate).map((v) => (
                <span key={v}
                  className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-mono">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Preview */}
      <Card>
        <SectionTitle>Message Preview</SectionTitle>
        {finalMessage ? (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4">
            {name && (
              <p className="text-xs text-gray-400 mb-3 text-center">
                To <span className="font-medium text-gray-600 dark:text-gray-300">{name}</span>
                {number && (
                  <span className="font-mono ml-1">· {number}</span>
                )}
              </p>
            )}
            <ChatBubble message={finalMessage} />
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {!messageTemplate ? "Write or select a template above" : "Fill in the fields to see preview"}
            </p>
          </div>
        )}
      </Card>

      {/* Send action */}
      <Card>
        <SectionTitle>Send</SectionTitle>

        {sent && (
          <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              ✓ WhatsApp opened — press send inside WhatsApp to deliver the message.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <PrimaryBtn
            onClick={handleSend}
            disabled={!isValid}
            className="flex-1 justify-center"
          >
            Open in WhatsApp →
          </PrimaryBtn>
          <SecondaryBtn onClick={handleReset}>
            Reset
          </SecondaryBtn>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 leading-relaxed">
          WhatsApp will open with the message pre-filled. You must press send manually.
        </p>
      </Card>

    </div>
  );
}