import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUB_SUPABASE_URL || "https://azglvgxpxwrhnunrvuof.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUB_SUPABASE_ANON_KEY || "sb_publishable_gFZvoJCUY8EN7d9qzheWAQ_RTTZt24H",
  },
};

export default nextConfig;
