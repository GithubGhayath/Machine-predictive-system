import { DeliverableDrawing } from "@/components/motion/DeliverableDrawings";
import { getDeliverables } from "@/lib/data";
import type { Locale } from "@/lib/data/types";

/**
 * Read like a datasheet: one row per deliverable, a drawing on one side, the
 * claim on the other, hairlines between. No cards.
 */
export default async function Deliverables({ locale }: { locale: Locale }) {
  const deliverables = await getDeliverables(locale);
  if (deliverables.length === 0) return null;

  return (
    <section
      id="deliverables"
      data-ground="deep"
      data-reveal-group
      className="section-pad"
    >
      <div className="shell">
        {deliverables.map((item, i) => (
          <article
            key={item.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-7 lg:py-10 ${
              i > 0 ? "border-t border-rule" : ""
            }`}
          >
            <div
              data-reveal
              className="lg:col-span-4 flex justify-center h-[11rem] lg:h-[14rem]"
            >
              <DeliverableDrawing id={item.id} />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <h3 data-reveal className="t-h3 mb-4">
                {item.title}
              </h3>
              <p data-reveal className="t-body text-fg-muted">
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
