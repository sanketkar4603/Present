import type { NextConfig } from "next";

/**
 * BUILD_TARGET=mobile produces a fully static export in `out/` for the
 * Capacitor Android app. API routes (route.ts) are excluded via
 * `pageExtensions`, so the companion runs on-device in that build.
 */
const mobile = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_MOBILE: mobile ? "1" : "",
  },
  ...(mobile
    ? {
        output: "export",
        trailingSlash: true,
        pageExtensions: ["tsx"],
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
