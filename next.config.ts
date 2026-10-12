import type { NextConfig } from "next";

// The sandbox preview proxy forwards requests with the sandbox Host header while the
// browser's origin stays the public preview origin, so Next's dev origin check and its
// Server Action CSRF check both need that host allow-listed. Only applied when the
// platform sets BASE44_PREVIEW_MODE=1; without it the app keeps its original configuration.
const previewHost =
  process.env.BASE44_PREVIEW_MODE === "1" && process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`
    : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: previewHost ? [previewHost] : [],
  experimental: previewHost
    ? { serverActions: { allowedOrigins: [previewHost] } }
    : {},
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUB_SUPABASE_URL || "https://azglvgxpxwrhnunrvuof.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUB_SUPABASE_ANON_KEY || "sb_publishable_gFZvoJCUY8EN7d9qzheWAQ_RTTZt24H",
  },
};

export default nextConfig;
