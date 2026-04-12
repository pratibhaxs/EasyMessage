import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchContacts, addContact, updateContact, deleteContact,
  fetchTemplates, addTemplate, updateTemplate, deleteTemplate,
  fetchGroups, addGroup, deleteGroup,
} from "./firestoreService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchContacts(user.uid),
      fetchTemplates(user.uid),
      fetchGroups(user.uid),
    ]).then(([c, t, g]) => {
      setContacts(c);
      setTemplates(t);
      setGroups(g);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── Contacts ──
  async function createContact(data) {
    const id = await addContact(user.uid, data);
    setContacts((prev) => [...prev, { ...data, id }]);
  }

  async function editContact(id, data) {
    await updateContact(user.uid, id, data);
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }

  async function removeContact(id) {
    await deleteContact(user.uid, id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Templates ──
  async function createTemplate(text) {
    const id = await addTemplate(user.uid, text);
    setTemplates((prev) => [{ id, text }, ...prev]);
    return id;
  }

  async function editTemplate(id, text) {
    await updateTemplate(user.uid, id, text);
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  async function removeTemplate(id) {
    await deleteTemplate(user.uid, id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Groups ──
  async function createGroup(name) {
    const id = await addGroup(user.uid, name);
    setGroups((prev) => [...prev, { id, name }]);
  }

  async function removeGroup(id) {
    await deleteGroup(user.uid, id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <AppContext.Provider value={{
      contacts, templates, groups, loading,
      createContact, editContact, removeContact,
      createTemplate, editTemplate, removeTemplate,
      createGroup, removeGroup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
