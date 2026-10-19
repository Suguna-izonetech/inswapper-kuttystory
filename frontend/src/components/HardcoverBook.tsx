import React, { useState } from "react";

export interface HardcoverBookProps {
  coverUrl: string;
  title: string;
  aspectRatio?: "square" | "portrait" | "standard";
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
  fallbackSrc?: string;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * HardcoverBook: Realistic 3D Hardcover Cover Page Mockup
 * Displays the cover page only (matching the reference image):
 * - Clean front hardcover casing without interior page leaves showing
 * - Cylindrical curved spine with lighting highlights on the left edge
 * - Embossed/debossed vertical hinge crease (French joint) running full height
 * - Soft shadow cast by the hinge groove onto the cover board
 * - Wrapped board casing with beveled rim and rounded corners
 * - Silk/satin lamination specular sheen
 * - Natural ambient and ground contact drop shadows
 */
export const HardcoverBook: React.FC<HardcoverBookProps> = ({
  coverUrl,
  title,
  aspectRatio = "square",
  className = "",
  imageClassName = "",
  children,
  fallbackSrc = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  onClick,
  interactive = true,
}) => {
  const [imgSrc, setImgSrc] = useState(coverUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : "aspect-[4/5]";

  return (
    <div
      onClick={onClick}
      className={`hardcover-perspective relative select-none w-full ${interactive ? "cursor-pointer" : ""} ${className}`}
    >
      {/* 1. Ground Contact Shadow (Natural physical shadow cast underneath the book base) */}
      <div
        className="absolute -bottom-3 left-[2%] w-[96%] h-4 rounded-full pointer-events-none transition-all duration-400 opacity-70 group-hover:opacity-90 group-hover:scale-x-105 group-hover:scale-y-125 group-hover:-bottom-4"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(30, 20, 25, 0.45) 0%, rgba(45, 34, 42, 0.22) 45%, rgba(0, 0, 0, 0) 75%)",
          filter: "blur(5px)",
        }}
        aria-hidden="true"
      />

      {/* 2. Primary Hardcover Cover Page Assembly (Cover Only — No Inner Pages) */}
      <div
        className={`hardcover-book relative w-full ${aspectClass} rounded-l-[5px] rounded-r-[8px] overflow-hidden bg-[#FAF7F2]`}
        style={{
          boxShadow: `
            inset 0 0 0 1px rgba(255, 255, 255, 0.45),
            inset 0 1.5px 2px rgba(255, 255, 255, 0.65),
            inset -1.5px -1.5px 2px rgba(0, 0, 0, 0.22),
            inset 1.5px 0 2px rgba(255, 255, 255, 0.35),
            0 12px 28px -4px rgba(45, 34, 42, 0.24),
            0 4px 10px -2px rgba(45, 34, 42, 0.12)
          `,
        }}
      >
        {/* Cover Artwork Image */}
        <img
          src={imgSrc}
          alt={title}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${imageClassName}`}
        />

        {/* Spine Cylindrical Curve (Leftmost gradient highlight & shadow) */}
        <div
          className="hardcover-spine-edge absolute top-0 bottom-0 left-0 w-[clamp(16px,5.2%,22px)] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Physical Hinge Crease / French Joint (Matches Reference Image exactly) */}
        <div
          className="hardcover-hinge-groove absolute top-0 bottom-0 left-[clamp(15px,5%,21px)] w-[3px] pointer-events-none z-10"
          style={{
            boxShadow:
              "-1px 0 2px rgba(0, 0, 0, 0.35), 1px 0 2px rgba(255, 255, 255, 0.45)",
          }}
          aria-hidden="true"
        />

        {/* Front Board Hinge Shadow (Soft shadow falling away from the hinge onto the board) */}
        <div
          className="hardcover-board-shadow absolute top-0 bottom-0 left-[calc(clamp(15px,5%,21px)+3px)] w-[clamp(14px,4.5%,20px)] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Hardcover Casing Outer Edge Bevel (Wrapped paper over thick board edge) */}
        <div
          className="absolute inset-0 rounded-l-[5px] rounded-r-[8px] pointer-events-none z-15"
          style={{
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.55), inset -1.5px 0 2px rgba(0, 0, 0, 0.25), inset 0 -1.5px 2px rgba(0, 0, 0, 0.3)",
          }}
          aria-hidden="true"
        />

        {/* Archival Silk/Satin Lamination Sheen (Soft ambient lighting across face) */}
        <div
          className="hardcover-silk-sheen absolute inset-0 pointer-events-none z-15 opacity-85"
          aria-hidden="true"
        />

        {/* Children / Interactive Overlays (Ribbon tags, preview buttons, etc.) */}
        {children && <div className="absolute inset-0 z-20">{children}</div>}
      </div>
    </div>
  );
};

export default HardcoverBook;
