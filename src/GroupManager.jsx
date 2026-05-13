import { useState } from "react";
import { useApp } from "./AppContext";
import { Card, Label, Input, PrimaryBtn, DangerGhostBtn, EmptyState, Badge } from "./ui";

export default function GroupManager() {
  const { groups, contacts, createGroup, removeGroup } = useApp();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Group name required"); return; }
    if (groups.find((g) => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Already exists"); return;
    }
    setSaving(true);
    try { await createGroup(trimmed); setName(""); setError(""); }
    catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id, groupName) {
    const count = contacts.filter((c) => c.group === groupName).length;
    if (count > 0 && !confirm(`Delete "${groupName}"? ${count} contact(s) will lose this group.`)) return;
    await removeGroup(id);
  }

  const totalGrouped = contacts.filter((c) => c.group).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main: groups */}
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Groups</h1>

          {/* Add form */}
          <Card className="p-4">
            <Label>New group</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder='e.g. VIP, Leads, Customers'
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  error={error}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <PrimaryBtn onClick={handleAdd} loading={saving} className="self-start">Add</PrimaryBtn>
            </div>
          </Card>

          {/* Groups — HubSpot pill style */}
          <Card className="p-4">
            <Label>All groups</Label>
            {groups.length === 0 ? (
              <EmptyState title='No groups yet · Try "VIP" or "Leads"' />
            ) : (
              <>
                {/* Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {groups.map((g) => {
                    const count = contacts.filter((c) => c.group === g.name).length;
                    return (
                      <div key={g.id} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full
                        bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
                        hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">{g.name}</span>
                        <span className="text-[11px] text-zinc-400 ml-0.5">{count}</span>
                        <button onClick={() => handleDelete(g.id, g.name)}
                          className="ml-1 text-zinc-300 hover:text-red-400 transition-colors text-sm leading-none
                            opacity-0 group-hover:opacity-100">
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Detail table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="py-2 text-left text-[11px] font-medium uppercase tracking-widest text-zinc-400">Group</th>
                      <th className="py-2 text-left text-[11px] font-medium uppercase tracking-widest text-zinc-400">Contacts</th>
                      <th className="py-2 text-right text-[11px] font-medium uppercase tracking-widest text-zinc-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                    {groups.map((g) => {
                      const count = contacts.filter((c) => c.group === g.name).length;
                      return (
                        <tr key={g.id} className="h-9 group hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-0">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{g.name}</span>
                            </div>
                          </td>
                          <td className="py-0">
                            <span className="text-[13px] text-zinc-400">{count} contact{count !== 1 ? "s" : ""}</span>
                          </td>
                          <td className="py-0 text-right">
                            <DangerGhostBtn
                              onClick={() => handleDelete(g.id, g.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Remove
                            </DangerGhostBtn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </Card>
        </div>

        {/* Right: stats */}
        <div className="space-y-3">
          <div className="pt-7" />
          <Card className="p-4">
            <Label>Overview</Label>
            <div className="space-y-3 mt-1">
              <div>
                <p className="text-[22px] font-semibold text-zinc-800 dark:text-zinc-100 leading-none">{groups.length}</p>
                <p className="text-[12px] text-zinc-400 mt-1">Groups created</p>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <p className="text-[22px] font-semibold text-zinc-800 dark:text-zinc-100 leading-none">{contacts.length}</p>
                <p className="text-[12px] text-zinc-400 mt-1">Total contacts</p>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <p className="text-[22px] font-semibold text-zinc-800 dark:text-zinc-100 leading-none">{totalGrouped}</p>
                <p className="text-[12px] text-zinc-400 mt-1">Assigned to a group</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <Label>Tip</Label>
            <p className="text-[12px] text-zinc-400 leading-relaxed">
              Assign contacts to groups when adding or editing them. Use Search to filter contacts by group.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
