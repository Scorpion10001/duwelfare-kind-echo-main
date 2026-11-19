import { z } from "zod";

export const WELFARE_CATEGORIES = [
  {
    name: "Hostel Welfare",
    description: "Accommodation, utilities, bathrooms and sanitation.",
    icon: "house",
    details: [
      "Accommodation conditions and maintenance",
      "Water and electricity supply",
      "Toilet and bathroom facilities",
      "Hostel sanitation and cleanliness",
      "Overcrowding and accommodation concerns",
    ],
  },
  {
    name: "Feeding and Nutrition Welfare",
    description: "Food quality, availability, affordability and hygiene.",
    icon: "utensils",
    details: [
      "Food availability and affordability",
      "Inadequate food portions",
      "Food quality and hygiene",
      "Restaurant and cafeteria accessibility",
      "Food vendor hygiene",
    ],
  },
  {
    name: "Security and Safety Welfare",
    description: "Campus security, unsafe areas and urgent concerns.",
    icon: "shield",
    details: [
      "Theft and loss of personal belongings",
      "Campus security concerns",
      "Unsafe campus locations",
      "Threats to student safety",
      "Emergency situations",
      "Suspicious activities",
    ],
  },
  {
    name: "Transportation Welfare",
    description: "Fair access, delays and campus transportation.",
    icon: "bus",
    details: ["Unfairness or favouritism", "Delays and irregular movement"],
  },
  {
    name: "Financial and Personal Support Welfare",
    description: "Financial difficulty, emergency assistance and hardship.",
    icon: "hand-heart",
    details: [
      "Financial difficulties",
      "Emergency financial assistance",
      "Students experiencing personal hardship",
    ],
  },
  {
    name: "Personal Welfare and Protection",
    description: "A confidential place to raise personal safety concerns.",
    icon: "heart-handshake",
    details: [
      "Sexual harassment",
      "Bullying and intimidation",
      "Discrimination and victimisation",
      "Emotional and psychological distress",
      "Abuse of authority",
      "Blackmail, coercion and exploitation",
      "Relationship-related personal concerns",
    ],
  },
  {
    name: "Academic Welfare",
    description: "Learning spaces, teaching and access to resources.",
    icon: "book-open",
    details: [
      "Inadequate classroom facilities, including fans, lighting and seating",
      "Lack of facilities and equipment required for specific courses",
      "Lecturer-related concerns and teaching methods",
      "Unfavourable learning conditions",
      "Academic timetable challenges",
      "Access to laboratories, libraries and other learning resources",
    ],
  },
] as const;

export const REPORT_STATUSES = ["pending", "reviewing", "escalated", "resolved"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type WelfareCategory = (typeof WELFARE_CATEGORIES)[number]["name"];

export const reportFormSchema = z.object({
  category: z.enum(WELFARE_CATEGORIES.map((category) => category.name) as [string, ...string[]]),
  concern: z.string().trim().min(2, "Add a short title for the concern.").max(160),
  location: z.string().trim().max(160).optional(),
  description: z
    .string()
    .trim()
    .min(20, "Please share at least a little more detail (20 characters).")
    .max(5000, "Please keep your report under 5,000 characters."),
  urgency: z.enum(["low", "normal", "high", "urgent"]),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;

const TICKET_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function createTicketId(): string {
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);
  const value = Array.from(randomBytes, (byte) => TICKET_ALPHABET[byte % TICKET_ALPHABET.length]).join("");
  return `DW-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

export function isTicketId(value: string): boolean {
  return /^DW-[0-9A-HJKMNP-TV-Z]{4}(?:-[0-9A-HJKMNP-TV-Z]{4}){2}$/i.test(value.trim());
}

export function normalizeTicketId(value: string): string {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const bare = normalized.replace(/^DW-?/, "").replaceAll("-", "");
  return bare.length === 12 ? `DW-${bare.slice(0, 4)}-${bare.slice(4, 8)}-${bare.slice(8)}` : normalized;
}

export function formatReportStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}