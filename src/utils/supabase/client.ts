import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/data/database.types'

export function createClient() {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUB_SUPABASE_URL || 
    'https://azglvgxpxwrhnunrvuof.supabase.co'
  ).trim()

  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUB_SUPABASE_ANON_KEY || 
    'sb_publishable_gFZvoJCUY8EN7d9qzheWAQ_RTTZt24H'
  ).trim()

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
