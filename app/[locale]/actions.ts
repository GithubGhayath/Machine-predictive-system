"use server";

import { submitContactForm } from "@/lib/data";
import type { ContactSubmission, FieldErrors } from "@/lib/data/types";

export type ContactState = {
  status: "idle" | "success" | "error";
  fieldErrors: FieldErrors;
  /** Echoed back on error so the form can restore what was typed. */
  values: ContactSubmission;
};

/**
 * A public lead form, so there is no session to check. Validation happens in
 * submitContactForm; this only turns FormData into a typed submission.
 *
 * Because this is a Server Action the form also works with JavaScript off,
 * and whatever URL endpoints.contactForm is later given never reaches the
 * browser.
 */
export async function sendContactRequest(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const read = (field: keyof ContactSubmission) => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
  };

  const values: ContactSubmission = {
    name: read("name"),
    company: read("company"),
    phone: read("phone"),
    machineType: read("machineType"),
    message: read("message"),
  };

  const result = await submitContactForm(values);

  if (result.ok) {
    return {
      status: "success",
      fieldErrors: {},
      values: { name: "", company: "", phone: "", machineType: "", message: "" },
    };
  }

  return { status: "error", fieldErrors: result.fieldErrors, values };
}
