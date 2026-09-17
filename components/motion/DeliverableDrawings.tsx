import { buildTrace, segmentStart } from "@/lib/trace";
import type { Deliverable } from "@/lib/data/types";

/**
 * Line drawings for what the client receives. They keep their aspect ratio —
 * these are illustrations, not charts — and mirror in RTL with the rest of the
 * page. The only amber is the out-of-band trace inside the phone alert, because
 * that is exactly what an alert reports.
 */

function AlertDrawing() {
  const blip = buildTrace({
    t0: segmentStart(8),
    span: 9,
    width: 60,
    height: 22,
    deviation: (p) => (p > 0.45 ? 1 : 0),
    band: 0.27,
    amplitude: 0.36,
    samples: 90,
    precision: 1,
  });

  return (
    // Cropped to the top of the handset: a close-up, so the alert is legible.
    <svg viewBox="44 4 112 158" aria-hidden className="trace-flow h-full w-auto">
      {/* handset */}
      <rect x={52} y={12} width={96} height={276} rx={16} fill="none" stroke="var(--trace)" strokeWidth={1.5} />
      <rect x={60} y={36} width={80} height={228} fill="none" stroke="var(--rule)" strokeWidth={1} />
      <line x1={88} y1={24} x2={112} y2={24} stroke="var(--rule)" strokeWidth={2} strokeLinecap="round" />

      {/* the notification */}
      <rect x={66} y={58} width={68} height={70} fill="var(--ground-raised)" stroke="var(--fg-muted)" strokeWidth={1} />
      <line x1={72} y1={70} x2={116} y2={70} stroke="var(--fg)" strokeWidth={3} strokeLinecap="round" />
      <line x1={72} y1={80} x2={104} y2={80} stroke="var(--fg-muted)" strokeWidth={2} strokeLinecap="round" />
      <g transform="translate(70 96)">
        <rect x={0} y={blip.bandTop} width={60} height={blip.bandBottom - blip.bandTop} fill="var(--corridor)" />
        <path d={blip.d} fill="none" stroke="var(--trace)" strokeWidth={1} />
        {blip.outOfBand.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--signal)" strokeWidth={1.75} />
        ))}
      </g>

      {/* older, already-read messages */}
      <rect x={66} y={138} width={68} height={26} fill="none" stroke="var(--rule)" strokeWidth={1} />
      <rect x={66} y={172} width={68} height={26} fill="none" stroke="var(--rule)" strokeWidth={1} />
    </svg>
  );
}

function RecordDrawing() {
  const lanes = Array.from({ length: 9 }, (_, i) =>
    buildTrace({
      t0: segmentStart(8) + 11 + i * 7.3,
      span: 12,
      width: 280,
      height: 18,
      deviation: 0,
      band: 0.5,
      amplitude: 0.4,
      samples: 110,
      precision: 1,
    }),
  );

  return (
    <svg viewBox="0 0 300 220" aria-hidden className="trace-flow h-full w-auto">
      <line x1={10} y1={8} x2={10} y2={212} stroke="var(--rule)" strokeWidth={1} />
      {lanes.map((lane, i) => (
        <g key={i} transform={`translate(14 ${14 + i * 22})`}>
          {/* older readings are fainter; the newest sits at the bottom */}
          <path
            d={lane.d}
            fill="none"
            stroke="var(--trace)"
            strokeWidth={1.1}
            opacity={0.25 + (i / (lanes.length - 1)) * 0.75}
          />
        </g>
      ))}
    </svg>
  );
}

function MountDrawing() {
  const fins = [80, 96, 112, 128, 144];

  return (
    <svg viewBox="0 0 300 220" aria-hidden className="trace-flow h-full w-auto">
      {/* motor housing, feet and shaft */}
      <rect x={40} y={66} width={170} height={100} fill="none" stroke="var(--trace)" strokeWidth={1.5} />
      {fins.map((y) => (
        <line key={y} x1={48} y1={y} x2={202} y2={y} stroke="var(--rule)" strokeWidth={1} />
      ))}
      <rect x={56} y={166} width={24} height={14} fill="none" stroke="var(--trace)" strokeWidth={1.25} />
      <rect x={170} y={166} width={24} height={14} fill="none" stroke="var(--trace)" strokeWidth={1.25} />
      <line x1={30} y1={188} x2={270} y2={188} stroke="var(--rule)" strokeWidth={1} />
      <rect x={210} y={106} width={44} height={20} fill="none" stroke="var(--trace)" strokeWidth={1.25} />

      {/* the clamp band goes around the housing — nothing is opened or cut */}
      <rect x={118} y={60} width={16} height={112} fill="none" stroke="var(--fg-muted)" strokeWidth={1.25} />

      {/* the sensor, outside the housing */}
      <rect x={110} y={34} width={32} height={26} fill="var(--ground-raised)" stroke="var(--fg)" strokeWidth={1.5} />
      <path d="M142 42 C 190 42, 196 18, 250 22" fill="none" stroke="var(--fg-muted)" strokeWidth={1.25} />
    </svg>
  );
}

const DRAWINGS: Record<Deliverable["id"], () => React.ReactElement> = {
  alert: AlertDrawing,
  record: RecordDrawing,
  install: MountDrawing,
};

export function DeliverableDrawing({ id }: { id: string }) {
  const Drawing = DRAWINGS[id];
  return Drawing ? <Drawing /> : null;
}
