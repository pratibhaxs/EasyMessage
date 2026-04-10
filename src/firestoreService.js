import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Contacts ──────────────────────────────────────────────────────────────────
// Path: users/{userId}/contacts/{contactId}

export async function fetchContacts(userId) {
  const ref = collection(db, "users", userId, "contacts");
  const q = query(ref, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addContact(userId, contact) {
  const ref = collection(db, "users", userId, "contacts");
  const docRef = await addDoc(ref, { ...contact, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function updateContact(userId, contactId, data) {
  const ref = doc(db, "users", userId, "contacts", contactId);
  await updateDoc(ref, data);
}

export async function deleteContact(userId, contactId) {
  const ref = doc(db, "users", userId, "contacts", contactId);
  await deleteDoc(ref);
}

// ── Templates ─────────────────────────────────────────────────────────────────
// Path: users/{userId}/templates/{templateId}

export async function fetchTemplates(userId) {
  const ref = collection(db, "users", userId, "templates");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addTemplate(userId, text) {
  const ref = collection(db, "users", userId, "templates");
  const docRef = await addDoc(ref, { text, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function deleteTemplate(userId, templateId) {
  const ref = doc(db, "users", userId, "templates", templateId);
  await deleteDoc(ref);
}
