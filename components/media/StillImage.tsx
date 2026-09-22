import Image from "next/image";

interface StillImageProps {
  src: string;
  /** Empty for purely atmospheric photography that the adjacent copy already covers. */
  alt?: string;
  sizes: string;
  /** Sets the shape: pass an aspect ratio and, where relevant, grid placement. */
  className?: string;
  priority?: boolean;
}

/**
 * Real photography from /public/images, graded by the same `.media-grade`
 * treatment the footage gets so stills and video read as one set.
 */
export default function StillImage({
  src,
  alt = "",
  sizes,
  className = "",
  priority = false,
}: StillImageProps) {
  return (
    <figure className={`media-grade relative overflow-clip ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </figure>
  );
}
