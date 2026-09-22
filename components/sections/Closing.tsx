import MediaClip from "@/components/media/MediaClip";
import SectionShell from "@/components/SectionShell";
import StillImage from "@/components/media/StillImage";
import ContactForm from "./ContactForm";
import { getClosing, getContactForm } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

/**
 * The trace ends calm: the flat line resumes.
 *
 * The form sits right beside (or right under) the closing statement, so its
 * submit button is the call to action. The separate "request" button only
 * appears if the form has no content — otherwise it would scroll a few pixels
 * to a heading with the same words, and spend the amber twice.
 */
export default async function Closing({ locale }: { locale: Locale }) {
  const [closing, form] = await Promise.all([
    getClosing(locale),
    getContactForm(locale),
  ]);
  if (!closing) return null;

  return (
    <SectionShell
      id="closing"
      index={11}
      ground="deep"
      heading={closing.heading}
      backdrop={<MediaClip slot="closing" variant="backdrop" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-14 lg:gap-16">
        <div>
          <p data-reveal className="t-lead">
            {closing.body}
          </p>
          <div data-reveal className="mt-10 hidden lg:block">
            <StillImage
              src="/images/hands-machine.webp"
              sizes="(min-width: 1024px) 32vw, 100vw"
              className="aspect-[4/3]"
            />
          </div>
          {form ? null : (
            <a data-reveal href={closing.cta.href} className="cta-solid mt-10">
              {closing.cta.label}
            </a>
          )}
        </div>

        {form ? (
          <div
            id="contact"
            data-reveal
            className="scroll-mt-[calc(var(--nav-h)+1rem)] border-t border-rule pt-10 lg:border-t-0 lg:pt-0"
          >
            <h3 className="t-h3 mb-8">{form.heading}</h3>
            <ContactForm content={form} />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
