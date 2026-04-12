import { useState, useMemo } from "react";
import { useApp } from "./AppContext";
import { Card, SectionTitle, Input, Select, Badge, EmptyState } from "./ui";

export default function SearchFilter() {
  const { contacts, groups } = useApp();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.number.includes(search.trim());
      const matchGroup = !groupFilter || c.group === groupFilter;
      return matchSearch && matchGroup;
    });
  }, [contacts, search, groupFilter]);

  const hasFilter = search.trim() || groupFilter;

  return (
    <Card>
      <SectionTitle>Search & Filter</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Input
          label="Search by name or number"
          placeholder="e.g. Rahul or 9876..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          label="Filter by group"
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
        >
          <option value="">All groups</option>
          {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </Select>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {hasFilter ? `${filtered.length} of ${contacts.length} contacts` : `${contacts.length} total contacts`}
        </p>
        {hasFilter && (
          <button onClick={() => { setSearch(""); setGroupFilter(""); }}
            className="text-xs text-green-600 dark:text-green-400 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {contacts.length === 0
        ? <EmptyState icon="🔍" title="No contacts to search" subtitle="Add contacts first" />
        : filtered.length === 0
          ? <EmptyState icon="😶" title="No matches found" subtitle="Try a different name or number" />
          : (
            <div className="space-y-2">
              {filtered.map(c => (
                <div key={c.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700
                    hover:border-green-300 dark:hover:border-green-700 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{c.number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.group && <Badge color="blue">{c.group}</Badge>}
                    <a href={`https://wa.me/${c.number.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                      className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium">
                      Open ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
    </Card>
  );
}
