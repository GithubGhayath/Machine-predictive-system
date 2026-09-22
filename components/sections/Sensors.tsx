import SectionBoundary from "@/components/chrome/SectionBoundary";
import MediaClip from "@/components/media/MediaClip";
import StillImage from "@/components/media/StillImage";
import {
  CurrentDrawing,
  TemperatureDrawing,
  VibrationDrawing,
} from "@/components/motion/SensorDrawings";
import { getSensors } from "@/lib/data";
import type { Locale, SensorId } from "@/lib/data/types";

/** SI units read the same in both languages, so they are not content. */
const UNIT: Record<SensorId, string> = {
  vibration: "mm/s RMS",
  temperature: "°C",
  current: "A",
};

/** The copy ranks these channels. The layout ranks them the same way. */
const WIDTH: Record<SensorId, string> = {
  vibration: "lg:col-span-12",
  temperature: "lg:col-span-9 lg:col-start-4",
  current: "lg:col-span-7 lg:col-start-6",
};

const INDEX: Record<SensorId, string> = {
  vibration: "01",
  temperature: "02",
  current: "03",
};

export default async function Sensors({ locale }: { locale: Locale }) {
  const sensors = await getSensors(locale);
  if (sensors.length === 0) return null;

  const vibrationName =
    sensors.find((sensor) => sensor.id === "vibration")?.name ?? "";

  return (
    <section
      id="sensors"
      data-ground="paper"
      data-reveal-group
      className="section-pad fold relative"
    >
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-x-6 lg:gap-x-8 gap-y-10 lg:gap-y-14">
        <MediaClip slot="sensors" variant="frame" className="lg:col-span-8 lg:row-start-2" />
        <StillImage
          src="/images/gears-macro.webp"
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="aspect-[16/9] lg:aspect-auto lg:col-span-4 lg:row-start-2"
        />

        {sensors.map((sensor) => {
          const lead = sensor.id === "vibration";
          return (
            <article
              key={sensor.id}
              className={`${WIDTH[sensor.id]} ${lead ? "lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-end" : ""}`}
            >
              <div data-reveal className={lead ? "lg:col-span-7" : undefined}>
                {sensor.id === "temperature" ? (
                  <TemperatureDrawing
                    vibrationLabel={vibrationName}
                    unit={UNIT.temperature}
                    locale={locale}
                  />
                ) : (
                  <>
                    <p className="t-label mb-1">
                      <span className="num">{UNIT[sensor.id]}</span>
                    </p>
                    {sensor.id === "vibration" ? <VibrationDrawing /> : <CurrentDrawing />}
                  </>
                )}
              </div>

              <div className={lead ? "lg:col-span-5" : undefined}>
                <p data-reveal className="t-label mt-4 mb-1 text-fg-muted">
                  <span className="num">{INDEX[sensor.id]}</span>
                </p>
                <h3 data-reveal className={lead ? "t-h2 mb-3" : "t-h3 mb-2"}>
                  {sensor.name}
                </h3>
                <p data-reveal className="t-body text-fg-muted">
                  {sensor.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <SectionBoundary />
    </section>
  );
}
