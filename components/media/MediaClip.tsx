import InViewVideo from "./InViewVideo";
import { getMediaAsset } from "@/lib/data";

/** The four places footage can appear. See lib/data/README.md. */
export type MediaSlot = "hero" | "sensors" | "installation" | "closing";

interface MediaClipProps {
  slot: MediaSlot;
  /**
   * `backdrop` fills its positioned parent behind the content, dimmed so the
   * text and the trace stay in charge. `frame` is a plain 16:9 block.
   */
  variant: "backdrop" | "frame";
  className?: string;
}

/**
 * Renders nothing until an asset exists for its slot, so every section is
 * complete without footage.
 */
export default async function MediaClip({ slot, variant, className = "" }: MediaClipProps) {
  const asset = await getMediaAsset(slot);
  if (!asset || (!asset.webm && !asset.mp4)) return null;

  if (variant === "backdrop") {
    return (
      <div
        aria-hidden
        className={`media-grade absolute inset-0 overflow-clip ${className}`}
      >
        <InViewVideo
          webm={asset.webm}
          mp4={asset.mp4}
          poster={asset.poster}
          isHero={slot === "hero"}
          className="size-full object-cover opacity-30"
        />
        {/* Keeps the ground's colour dominant over the footage. */}
        <div className="absolute inset-0 bg-ground/60" />
      </div>
    );
  }

  return (
    <figure className={`media-grade ${className}`}>
      <InViewVideo
        webm={asset.webm}
        mp4={asset.mp4}
        poster={asset.poster}
        label={asset.alt}
        className="block aspect-video w-full object-cover"
      />
    </figure>
  );
}
