import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Contacts ──────────────────────────────────────────────────────────────────
export async function fetchContacts(userId) {
  const q = query(collection(db, "users", userId, "contacts"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function addContact(userId, contact) {
  const ref = await addDoc(collection(db, "users", userId, "contacts"), { ...contact, createdAt: serverTimestamp() });
  return ref.id;
}
export async function updateContact(userId, contactId, data) {
  await updateDoc(doc(db, "users", userId, "contacts", contactId), data);
}
export async function deleteContact(userId, contactId) {
  await deleteDoc(doc(db, "users", userId, "contacts", contactId));
}

// ── Templates ─────────────────────────────────────────────────────────────────
export async function fetchTemplates(userId) {
  const q = query(collection(db, "users", userId, "templates"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function addTemplate(userId, text) {
  const ref = await addDoc(collection(db, "users", userId, "templates"), { text, createdAt: serverTimestamp() });
  return ref.id;
}
export async function updateTemplate(userId, templateId, text) {
  await updateDoc(doc(db, "users", userId, "templates", templateId), { text });
}
export async function deleteTemplate(userId, templateId) {
  await deleteDoc(doc(db, "users", userId, "templates", templateId));
}

// ── Groups ────────────────────────────────────────────────────────────────────
export async function fetchGroups(userId) {
  const q = query(collection(db, "users", userId, "groups"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function addGroup(userId, name) {
  const ref = await addDoc(collection(db, "users", userId, "groups"), { name, createdAt: serverTimestamp() });
  return ref.id;
}
export async function deleteGroup(userId, groupId) {
  await deleteDoc(doc(db, "users", userId, "groups", groupId));
}
