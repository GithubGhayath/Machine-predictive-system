"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactRequest, type ContactState } from "@/app/[locale]/actions";
import { FIELD_LIMITS } from "@/lib/data/limits";
import type { ContactFormContent } from "@/lib/data/types";

const initialState: ContactState = {
  status: "idle",
  fieldErrors: {},
  values: { name: "", company: "", phone: "", machineType: "", message: "" },
};

/** Short fields pair up on wide screens; the message always spans the row. */
const SPAN: Record<string, string> = {
  message: "md:col-span-2",
};

export default function ContactForm({ content }: { content: ContactFormContent }) {
  const [state, formAction, pending] = useActionState(
    sendContactRequest,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  // After a failed submit, put the keyboard on the first field that needs work.
  useEffect(() => {
    if (state.status === "error") {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      (firstInvalid ?? statusRef.current)?.focus();
    }
    if (state.status === "success") statusRef.current?.focus();
  }, [state]);

  const statusText =
    state.status === "success"
      ? content.successMessage
      : state.status === "error"
        ? content.errorMessage
        : "";

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7"
    >
      {content.fields.map((field) => {
        const id = `contact-${field.name}`;
        const error = state.fieldErrors[field.name];
        const errorId = `${id}-error`;
        const shared = {
          id,
          name: field.name,
          required: field.required,
          maxLength: FIELD_LIMITS[field.name],
          defaultValue: state.values[field.name],
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? errorId : undefined,
          className: "field-input",
        };

        return (
          <div key={field.name} className={SPAN[field.name] ?? ""}>
            <label htmlFor={id} className="block mb-2 text-[0.95rem]">
              {field.label}
              {field.required ? (
                <span aria-hidden className="text-fg-muted">
                  {" "}
                  *
                </span>
              ) : null}
            </label>

            {field.type === "textarea" ? (
              <textarea {...shared} rows={5} />
            ) : (
              <input
                {...shared}
                type={field.type}
                autoComplete={
                  field.name === "name"
                    ? "name"
                    : field.name === "company"
                      ? "organization"
                      : field.name === "phone"
                        ? "tel"
                        : "off"
                }
                inputMode={field.type === "tel" ? "tel" : undefined}
                // Phone numbers read left to right in both languages.
                dir={field.type === "tel" ? "ltr" : undefined}
              />
            )}

            {error ? (
              <p id={errorId} className="field-error mt-2">
                {content.fieldMessages[error]}
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2">
        <button type="submit" className="cta-solid" disabled={pending}>
          {pending ? content.pendingLabel : content.submitLabel}
        </button>
        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="t-body outline-none"
        >
          {statusText}
        </p>
      </div>
    </form>
  );
}
