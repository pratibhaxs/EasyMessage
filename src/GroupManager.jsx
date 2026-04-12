import { useState } from "react";
import { useApp } from "./AppContext";
import { Card, SectionTitle, PrimaryBtn, DangerBtn, Input, EmptyState, Badge } from "./ui";

export default function GroupManager() {
  const { groups, contacts, createGroup, removeGroup } = useApp();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) { setError("Group name is required"); return; }
    if (groups.find(g => g.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A group with this name already exists"); return;
    }
    setSaving(true);
    try {
      await createGroup(name.trim());
      setName("");
      setError("");
    } catch (e) { alert("Error creating group: " + e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id, groupName) {
    const count = contacts.filter(c => c.group === groupName).length;
    if (count > 0 && !confirm(`This group has ${count} contact(s). Delete anyway?`)) return;
    await removeGroup(id);
  }

  return (
    <Card>
      <SectionTitle>Groups</SectionTitle>

      {/* Add group form */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="e.g. VIP, Leads, Customers"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            error={error}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
        </div>
        <PrimaryBtn onClick={handleAdd} loading={saving} className="flex-shrink-0 self-start">
          Add
        </PrimaryBtn>
      </div>

      {/* Groups list */}
      {groups.length === 0
        ? <EmptyState icon="🏷️" title="No groups yet" subtitle='Add groups like "VIP" or "Leads"' />
        : (
          <div className="space-y-2">
            {groups.map(g => {
              const count = contacts.filter(c => c.group === g.name).length;
              return (
                <div key={g.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{g.name}</span>
                    <Badge color="gray">{count} contact{count !== 1 ? "s" : ""}</Badge>
                  </div>
                  <button onClick={() => handleDelete(g.id, g.name)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs">
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        )}
    </Card>
  );
}
