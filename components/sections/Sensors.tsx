import MediaClip from "@/components/media/MediaClip";
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
      className="section-pad fold"
    >
      <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-y-14">
        <MediaClip slot="sensors" variant="frame" className="lg:col-span-8 lg:row-start-2" />

        {sensors.map((sensor) => (
          <article key={sensor.id} className={WIDTH[sensor.id]}>
            <div data-reveal>
              {sensor.id === "temperature" ? (
                <TemperatureDrawing
                  vibrationLabel={vibrationName}
                  unit={UNIT.temperature}
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
            <h3 data-reveal className="t-h3 mt-4 mb-2">
              {sensor.name}
            </h3>
            <p data-reveal className="t-body text-fg-muted">
              {sensor.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
