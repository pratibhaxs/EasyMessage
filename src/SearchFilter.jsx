import { useState, useMemo } from "react";
import { useApp } from "./AppContext";
import { Badge, GhostBtn } from "./ui";

export default function SearchFilter() {
  const { contacts, groups } = useApp();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.number.includes(q);
      const matchGroup = !groupFilter || c.group === groupFilter;
      return matchSearch && matchGroup;
    });
  }, [contacts, search, groupFilter]);

  const hasFilter = search.trim() || groupFilter;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Search</h1>

      {/* Slack-style prominent search bar */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
        </svg>
        <input
          type="text"
          placeholder="Search contacts by name or number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full h-10 pl-9 pr-4 text-[14px] rounded-lg border border-zinc-200 dark:border-zinc-700
            bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
            transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-lg leading-none">
            ×
          </button>
        )}
      </div>

      {/* Filter chips — group tags */}
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setGroupFilter("")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors
              ${!groupFilter
                ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
            All
          </button>
          {groups.map((g) => {
            const count = contacts.filter((c) => c.group === g.name).length;
            return (
              <button key={g.id}
                onClick={() => setGroupFilter(groupFilter === g.name ? "" : g.name)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1
                  ${groupFilter === g.name
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
                {g.name}
                <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results count + clear */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-medium">
          {hasFilter
            ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
            : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
        </p>
        {hasFilter && (
          <button onClick={() => { setSearch(""); setGroupFilter(""); }}
            className="text-[11px] text-zinc-400 hover:text-zinc-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Results — inline, no card wrapper */}
      {contacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[13px] text-zinc-400">No contacts yet</p>
          <p className="text-[12px] text-zinc-300 dark:text-zinc-600 mt-1">Add contacts to search them here</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[13px] text-zinc-400">No matches for "{search || groupFilter}"</p>
          <button onClick={() => { setSearch(""); setGroupFilter(""); }}
            className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline mt-1 font-medium">
            Clear search
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                {["Name", "Number", "Group", ""].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-zinc-400
                    ${i === 3 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="h-9 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group">
                  <td className="px-4 py-0">
                    <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{c.name}</span>
                  </td>
                  <td className="px-4 py-0">
                    <span className="text-[12px] font-mono text-zinc-400 dark:text-zinc-500">{c.number}</span>
                  </td>
                  <td className="px-4 py-0">
                    {c.group
                      ? <Badge color="blue">{c.group}</Badge>
                      : <span className="text-zinc-300 dark:text-zinc-700">—</span>}
                  </td>
                  <td className="px-4 py-0 text-right">
                    <a href={`https://wa.me/${c.number.replace(/\D/g, "")}`}
                      target="_blank" rel="noreferrer"
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 opacity-0
                        group-hover:opacity-100 hover:underline transition-opacity font-medium">
                      Open ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}
