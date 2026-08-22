import type { Contact } from "@/lib/types/contact"

export const CONTACTS: Contact[] = [
  {
    name: "Amma",
    user: "family",
    tone: "c",
    presence: "offline",
    note: "Last seen at 9:04 AM",
  },
  {
    name: "Farhan Kabir",
    user: "farhan",
    tone: "a",
    presence: "offline",
    note: "Last seen Tuesday",
  },
  {
    name: "Ishrat Jahan",
    user: "ishrat",
    tone: "b",
    presence: "away",
    note: "In a meeting",
  },
  {
    name: "Nadia Hasan",
    user: "nadia",
    tone: "b",
    presence: "online",
    note: "Product designer, Dhaka",
  },
  {
    name: "Rakib Islam",
    user: "rakib",
    tone: "c",
    presence: "online",
    note: "Frontend engineer",
  },
  {
    name: "Sumaiya Akter",
    user: "sumaiya",
    tone: "d",
    presence: "online",
    note: "QA lead",
  },
  {
    name: "Tanvir Rahman",
    user: "tanvir",
    tone: "f",
    presence: "away",
    note: "Backend, Signal team",
  },
  {
    name: "Zarif Chowdhury",
    user: "zarif",
    tone: "e",
    presence: "offline",
    note: "Last seen yesterday",
  },
]

export function filterContacts(contacts: Contact[], query: string) {
  const term = query.trim().toLowerCase()
  if (!term) return contacts
  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(term) ||
      contact.user.toLowerCase().includes(term)
  )
}
