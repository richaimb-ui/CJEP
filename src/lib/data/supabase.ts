import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUB_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  'https://azglvgxpxwrhnunrvuof.supabase.co'
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUB_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'sb_publishable_gFZvoJCUY8EN7d9qzheWAQ_RTTZt24H'
).trim();

const supabaseServiceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_KEY
)?.trim();

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Utilisé uniquement côté serveur (Server Actions / API) pour contourner le RLS et gérer l'Auth
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey)
  : null;
