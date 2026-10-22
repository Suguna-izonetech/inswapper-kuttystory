/**
 * Client-Side Smart Background Removal & Studio Solid Backdrop Processor
 * Isolates the subject and replaces cluttered/unsuitable backgrounds with a clean solid color
 * to maximize character likeness and prevent background clutter.
 */

export interface BackdropPreset {
  id: string;
  name: string;
  hex: string;
  label: string;
}

export const BACKDROP_PRESETS: BackdropPreset[] = [
  { id: "ivory", name: "Heirloom Ivory", hex: "#FAF7F2", label: "Storybook Atelier Base" },
  { id: "white", name: "Studio Pure White", hex: "#FFFFFF", label: "Clean High Contrast" },
  { id: "sage", name: "Soft Fairytale Sage", hex: "#EEF4ED", label: "Gentle Natural Tone" },
  { id: "lavender", name: "Starlight Lavender", hex: "#F2EEF7", label: "Enchanted Pastel" },
];

/**
 * Remove noisy background from an image URL / File and place onto a solid studio backdrop.
 */
export async function processSolidBackground(
  imageSrc: string,
  bgColorHex: string = "#FAF7F2",
  smoothing: number = 0.5
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const maxDim = 800;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Could not initialize 2D canvas context");

        // Draw original image
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // 1. Sample perimeter background colors (corners & top edges)
        const samplePixels: number[][] = [];
        const sampleOffsets = [
          [0, 0],
          [width - 1, 0],
          [0, Math.floor(height * 0.25)],
          [width - 1, Math.floor(height * 0.25)],
          [Math.floor(width * 0.1), 0],
          [Math.floor(width * 0.9), 0],
          [Math.floor(width * 0.5), 0],
        ];

        sampleOffsets.forEach(([sx, sy]) => {
          const idx = (sy * width + sx) * 4;
          samplePixels.push([data[idx], data[idx + 1], data[idx + 2]]);
        });

        // 2. Target Solid Background Color parse
        const hex = bgColorHex.replace("#", "");
        const targetR = parseInt(hex.substring(0, 2), 16) || 250;
        const targetG = parseInt(hex.substring(2, 4), 16) || 247;
        const targetB = parseInt(hex.substring(4, 6), 16) || 242;

        // 3. Subject Center & Falloff Parameters (Human portrait usually centered in upper half)
        const centerX = width * 0.5;
        const centerY = height * 0.45;
        const radiusX = width * 0.38;
        const radiusY = height * 0.44;

        // Process pixel alpha & blending
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Distance from subject focus oval (head & shoulders)
            const dx = (x - centerX) / radiusX;
            const dy = (y - centerY) / radiusY;
            const distSq = dx * dx + dy * dy;

            // Distance to sampled background colors
            let minBgDist = 999;
            for (const [sR, sG, sB] of samplePixels) {
              const d = Math.sqrt((r - sR) ** 2 + (g - sG) ** 2 + (b - sB) ** 2);
              if (d < minBgDist) minBgDist = d;
            }

            // Foreground confidence based on spatial location & background color difference
            let fgScore = 0;
            if (distSq < 0.6) {
              // Deep inside headshot area -> strongly foreground
              fgScore = 1.0;
            } else if (distSq < 1.1) {
              // Boundary transition zone: evaluate color contrast vs background
              const colorRatio = Math.min(minBgDist / 60, 1.0);
              const spatialWeight = 1.0 - (distSq - 0.6) / 0.5;
              fgScore = Math.max(0, Math.min(1, spatialWeight * 0.6 + colorRatio * 0.4));
            } else {
              // Outer periphery (room walls, clutter, outdoor background)
              const colorRatio = Math.min(minBgDist / 90, 1.0);
              const edgeFade = Math.max(0, 1.0 - (distSq - 1.1) * 2.0);
              fgScore = Math.max(0, Math.min(1, colorRatio * edgeFade * 0.4));
            }

            // Adjust with smoothing parameter
            const alpha = Math.min(1, Math.max(0, fgScore ** (1.0 / (smoothing + 0.5))));

            // Blend foreground pixel over the plain solid background color
            data[idx] = Math.round(r * alpha + targetR * (1 - alpha));
            data[idx + 1] = Math.round(g * alpha + targetG * (1 - alpha));
            data[idx + 2] = Math.round(b * alpha + targetB * (1 - alpha));
            data[idx + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to export canvas blob"));
              return;
            }
            const dataUrl = canvas.toDataURL("image/jpeg", 0.94);
            resolve({ dataUrl, blob });
          },
          "image/jpeg",
          0.94
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for processing"));
    img.src = imageSrc;
  });
}
