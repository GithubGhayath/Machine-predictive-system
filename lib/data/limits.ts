import type { ContactSubmission } from "./types";

/**
 * Upper bounds, in characters. Enforced by submitContactForm on the server and
 * set as maxLength on the inputs. Safe to import from client components.
 */
export const FIELD_LIMITS: Record<keyof ContactSubmission, number> = {
  name: 120,
  company: 160,
  phone: 32,
  machineType: 160,
  message: 2000,
};
