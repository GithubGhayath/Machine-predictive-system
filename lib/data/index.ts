import { fetchMediaAsset, fetchSiteContent, postContactForm } from "./client";
import { FIELD_LIMITS } from "./limits";
import type {
  BaselineContent,
  ClosingContent,
  ContactFormContent,
  ContactSubmission,
  Deliverable,
  FieldErrors,
  FooterContent,
  HeroContent,
  InstallationStep,
  LimitsContent,
  Locale,
  MediaAsset,
  NavContent,
  NotFoundContent,
  PreloaderContent,
  ProseSection,
  SensorChannel,
  SubmitResult,
  WarningWindowContent,
} from "./types";

/**
 * The only surface components are allowed to touch. Every getter is async and
 * returns a typed Promise even though the data is local today, so introducing a
 * network boundary later does not force a refactor of any call site.
 *
 * Every getter returns null (or an empty array) when its data is missing. The
 * matching section renders nothing rather than throwing.
 */

async function content(locale: Locale) {
  return fetchSiteContent(locale);
}

export async function getNavContent(locale: Locale): Promise<NavContent | null> {
  return (await content(locale))?.nav ?? null;
}

export async function getPreloaderContent(
  locale: Locale,
): Promise<PreloaderContent | null> {
  return (await content(locale))?.preloader ?? null;
}

export async function getHeroContent(locale: Locale): Promise<HeroContent | null> {
  return (await content(locale))?.hero ?? null;
}

export async function getCostSection(locale: Locale): Promise<ProseSection | null> {
  return (await content(locale))?.cost ?? null;
}

export async function getWarningWindow(
  locale: Locale,
): Promise<WarningWindowContent | null> {
  const section = (await content(locale))?.warningWindow;
  if (!section?.stages?.length) return null;
  return section;
}

export async function getSensors(locale: Locale): Promise<SensorChannel[]> {
  return (await content(locale))?.sensors ?? [];
}

export async function getBaseline(locale: Locale): Promise<BaselineContent | null> {
  return (await content(locale))?.baseline ?? null;
}

export async function getDeliverables(locale: Locale): Promise<Deliverable[]> {
  return (await content(locale))?.deliverables ?? [];
}

export async function getLimits(locale: Locale): Promise<LimitsContent | null> {
  return (await content(locale))?.limits ?? null;
}

export async function getInstallationSteps(
  locale: Locale,
): Promise<InstallationStep[]> {
  const steps = (await content(locale))?.installation ?? [];
  return [...steps].sort((a, b) => a.step - b.step);
}

export async function getClosing(locale: Locale): Promise<ClosingContent | null> {
  return (await content(locale))?.closing ?? null;
}

export async function getContactForm(
  locale: Locale,
): Promise<ContactFormContent | null> {
  const form = (await content(locale))?.contact;
  if (!form?.fields?.length) return null;
  return form;
}

export async function getFooterContent(
  locale: Locale,
): Promise<FooterContent | null> {
  return (await content(locale))?.footer ?? null;
}

export async function getNotFoundContent(
  locale: Locale,
): Promise<NotFoundContent | null> {
  return (await content(locale))?.notFound ?? null;
}

export async function getMediaAsset(id: string): Promise<MediaAsset | null> {
  return fetchMediaAsset(id);
}

const REQUIRED_FIELDS = ["name", "company", "phone"] as const;

export async function submitContactForm(
  submission: ContactSubmission,
): Promise<SubmitResult> {
  const fieldErrors: FieldErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!submission[field].trim()) fieldErrors[field] = "required";
  }

  for (const field of Object.keys(FIELD_LIMITS) as (keyof ContactSubmission)[]) {
    if (!fieldErrors[field] && submission[field].length > FIELD_LIMITS[field]) {
      fieldErrors[field] = "invalid";
    }
  }

  // Loose on purpose: Syrian landlines, mobiles and international formats all
  // pass. It only catches input that cannot be a phone number at all.
  const digits = submission.phone.replace(/\D/g, "");
  if (!fieldErrors.phone && (digits.length < 6 || digits.length > 15)) {
    fieldErrors.phone = "invalid";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const result = await postContactForm(submission);
  return result.ok ? { ok: true } : { ok: false, fieldErrors: {} };
}

export type {
  BaselineContent,
  ClosingContent,
  ContactFormContent,
  ContactSubmission,
  Deliverable,
  FieldErrors,
  FooterContent,
  HeroContent,
  InstallationStep,
  LimitsContent,
  Locale,
  MediaAsset,
  NavContent,
  NotFoundContent,
  PreloaderContent,
  ProseSection,
  SensorChannel,
  SubmitResult,
  WarningWindowContent,
};
