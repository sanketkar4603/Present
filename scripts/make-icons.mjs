// Renders the app icon + splash artwork (Nimbus the cloud) to PNGs.
// Output: assets/* (source images for @capacitor/assets) and public/icons/* (PWA).
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const BG = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a68cf3"/>
      <stop offset="0.55" stop-color="#7152d4"/>
      <stop offset="1" stop-color="#281d4d"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#ffb3a3" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffb3a3" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

/** Cloud drawn in a 200x164 box, translated/scaled by the caller. */
const cloud = (tx, ty, s) => `
  <defs>
    <linearGradient id="body" x1="40" y1="20" x2="170" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.6" stop-color="#f1ebff"/>
      <stop offset="1" stop-color="#d6c8fe"/>
    </linearGradient>
  </defs>
  <g transform="translate(${tx} ${ty}) scale(${s})">
    <ellipse cx="104" cy="156" rx="46" ry="6" fill="#140d29" opacity="0.18"/>
    <g fill="url(#body)">
      <circle cx="68" cy="98" r="38"/>
      <circle cx="108" cy="72" r="48"/>
      <circle cx="146" cy="100" r="34"/>
      <rect x="40" y="96" width="132" height="44" rx="22"/>
    </g>
    <g transform="translate(108 26)">
      <path d="M0 0 C0 -8 0 -12 0 -16" stroke="#24a379" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M0 -12 C-12 -22 -20 -14 -18 -8 C-12 -6 -6 -8 0 -12Z" fill="#6fdcb2"/>
      <path d="M0 -14 C10 -26 20 -18 18 -12 C12 -9 6 -10 0 -14Z" fill="#3fc596"/>
    </g>
    <ellipse cx="78" cy="112" rx="9" ry="5.5" fill="#ff8c76" opacity="0.45"/>
    <ellipse cx="136" cy="112" rx="9" ry="5.5" fill="#ff8c76" opacity="0.45"/>
    <g stroke="#2a1d4f" stroke-width="4.5" stroke-linecap="round" fill="none">
      <path d="M84 100 q7 -9 14 0"/>
      <path d="M116 100 q7 -9 14 0"/>
      <path d="M98 112 q9 9 18 0"/>
    </g>
  </g>`;

const svg = (w, h, inner) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`);

// Full icon (cloud fills ~70% of the square).
const fullIcon = (size, rounded) => {
  const s = (size * 0.7) / 200;
  const tx = (size - 200 * s) / 2;
  const ty = (size - 164 * s) / 2 + size * 0.03;
  const r = rounded ? size * 0.22 : 0;
  return svg(size, size, `${BG}<rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/><rect width="${size}" height="${size}" rx="${r}" fill="url(#glow)"/>${cloud(tx, ty, s)}`);
};

// Adaptive-icon foreground: cloud kept inside the central safe zone (~60%).
const foreground = (size) => {
  const s = (size * 0.5) / 200;
  return svg(size, size, cloud((size - 200 * s) / 2, (size - 164 * s) / 2 + size * 0.02, s));
};

const background = (size) => svg(size, size, `${BG}<rect width="${size}" height="${size}" fill="url(#bg)"/><rect width="${size}" height="${size}" fill="url(#glow)"/>`);

const splash = (size, dark) => {
  const s = (size * 0.22) / 200;
  const fill = dark ? "#120c22" : "#fbf6ef";
  const ink = dark ? "#f5f0ff" : "#221839";
  const tx = (size - 200 * s) / 2;
  const ty = size / 2 - 164 * s * 0.75;
  return svg(
    size,
    size,
    `<rect width="${size}" height="${size}" fill="${fill}"/>${cloud(tx, ty, s)}
     <text x="${size / 2}" y="${ty + 164 * s + size * 0.06}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${size * 0.035}" letter-spacing="${size * 0.008}" fill="${ink}">PRESENT</text>`,
  );
};

const png = (buf, file) => sharp(buf).png().toFile(file);

await mkdir("assets", { recursive: true });
await mkdir("public/icons", { recursive: true });

await Promise.all([
  // @capacitor/assets sources
  png(fullIcon(1024, false), "assets/icon-only.png"),
  png(foreground(1024), "assets/icon-foreground.png"),
  png(background(1024), "assets/icon-background.png"),
  png(splash(2732, false), "assets/splash.png"),
  png(splash(2732, true), "assets/splash-dark.png"),
  // PWA / web
  png(fullIcon(192, true), "public/icons/icon-192.png"),
  png(fullIcon(512, true), "public/icons/icon-512.png"),
  png(fullIcon(512, false), "public/icons/maskable-512.png"),
  png(fullIcon(180, false), "public/icons/apple-touch-icon.png"),
  png(fullIcon(64, true), "public/icons/favicon-64.png"),
]);
console.log("Icons and splash screens written.");
