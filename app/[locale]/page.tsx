import { notFound } from "next/navigation";
import { isLocale } from "@/content/site.config";
import { getPreloaderContent } from "@/lib/data";
import MotionProvider from "@/components/motion/MotionProvider";
import Preloader from "@/components/motion/Preloader";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import Hero from "@/components/sections/Hero";
import Cost from "@/components/sections/Cost";
import WarningWindow from "@/components/sections/WarningWindow";
import Sensors from "@/components/sections/Sensors";
import Baseline from "@/components/sections/Baseline";
import Deliverables from "@/components/sections/Deliverables";
import Limits from "@/components/sections/Limits";
import Installation from "@/components/sections/Installation";
import Closing from "@/components/sections/Closing";

/**
 * Ground sequence, top to bottom:
 *   deep · paper · paper→deep→paper · paper · paper · deep · paper · paper · deep
 * Paper carries most of the page; graphite marks the start, the alert, what you
 * receive, and the close.
 */
export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const preloader = await getPreloaderContent(locale);

  return (
    <>
      <Preloader locale={locale} loading={preloader?.loading ?? null} />
      <MotionProvider>
        <Header locale={locale} />
        <main id="main">
          <Hero locale={locale} />
          <Cost locale={locale} />
          <WarningWindow locale={locale} />
          <Sensors locale={locale} />
          <Baseline locale={locale} />
          <Deliverables locale={locale} />
          <Limits locale={locale} />
          <Installation locale={locale} />
          <Closing locale={locale} />
        </main>
        <Footer locale={locale} />
      </MotionProvider>
    </>
  );
}
