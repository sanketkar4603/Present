import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.present.mindful",
  appName: "PRESENT",
  // Static export produced by `npm run build:mobile` (BUILD_TARGET=mobile next build).
  webDir: "out",
  backgroundColor: "#120c22",
  android: {
    // Never allow plain-http content inside the app.
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      // Edge-to-edge with correct env()/--safe-area-inset-* values.
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
  },
};

export default config;
