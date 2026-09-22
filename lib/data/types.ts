export type Locale = "ar" | "en";

export interface Cta {
  label: string;
  href: string;
}

export interface LiveControlContent {
  /** Shown while the hero trace runs. */
  running: string;
  /** Shown while it is held. */
  held: string;
  /** Accessible names for the switch in each state. */
  pause: string;
  resume: string;
}

export interface HeroContent {
  headline: string;
  subline: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  liveControl: LiveControlContent;
}

export interface ProseSection {
  id: string;
  heading: string;
  body: string;
  /** A single sentence pulled out and set apart — the stakes in one line. */
  callout?: string;
}

export interface WarningStage {
  id: string;
  title: string;
  body: string;
  /** 0–1. How far this stage's reading sits outside the learned band. */
  deviation: number;
  /** Ground this stage renders on. The narrative drives the palette, not the layout. */
  ground: "paper" | "deep";
}

export interface WarningWindowContent {
  stages: WarningStage[];
  closing: string;
}

export type SensorId = "vibration" | "temperature" | "current";

export interface SensorChannel {
  id: SensorId;
  name: string;
  body: string;
}

export interface BaselineContent {
  heading: string;
  body: string;
  callout: string;
  /** Names for the two same-model machines in the drawing. */
  machineLabels: [string, string];
}

export interface Deliverable {
  id: string;
  title: string;
  body: string;
}

export interface LimitsDiagramLabels {
  healthy: string;
  faulty: string;
  falseAlarms: string;
  missedFaults: string;
  threshold: string;
}

export interface LimitsContent {
  heading: string;
  body: string;
  diagram: LimitsDiagramLabels;
}

export interface InstallationStep {
  step: number;
  title: string;
  body: string;
}

export interface ClosingContent {
  heading: string;
  body: string;
  cta: Cta;
}

export type ContactFieldType = "text" | "tel" | "textarea";

export interface ContactField {
  name: "name" | "company" | "phone" | "machineType" | "message";
  label: string;
  type: ContactFieldType;
  required: boolean;
  /** Example input only — never rendered as a real value, never submitted. */
  placeholder?: string;
}

export type FieldErrorCode = "required" | "invalid";

export interface ContactFormContent {
  heading: string;
  fields: ContactField[];
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  errorMessage: string;
  fieldMessages: Record<FieldErrorCode, string>;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavContent {
  links: NavLink[];
  languageLabel: string;
  skipToContent: string;
}

export interface FooterContent {
  description: string;
  contactLabel: string;
  copyright: string;
}

/**
 * A video clip. Every field is optional except id and alt: until real footage
 * exists, getMediaAsset() returns null and the consuming section renders its
 * vector treatment alone rather than a broken frame.
 */
export interface NotFoundContent {
  heading: string;
  body: string;
  homeLabel: string;
}

/** The one string the preloader announces to assistive tech while it holds the page. */
export interface PreloaderContent {
  loading: string;
}

export interface MediaAsset {
  id: string;
  webm?: string;
  mp4?: string;
  poster?: string;
  alt: string;
}

export interface SiteContent {
  nav: NavContent;
  preloader: PreloaderContent;
  hero: HeroContent;
  cost: ProseSection;
  warningWindow: WarningWindowContent;
  sensors: SensorChannel[];
  baseline: BaselineContent;
  deliverables: Deliverable[];
  limits: LimitsContent;
  installation: InstallationStep[];
  closing: ClosingContent;
  contact: ContactFormContent;
  footer: FooterContent;
  notFound: NotFoundContent;
}

export interface ContactSubmission {
  name: string;
  company: string;
  phone: string;
  machineType: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof ContactSubmission, FieldErrorCode>>;

export type SubmitResult = { ok: true } | { ok: false; fieldErrors: FieldErrors };
