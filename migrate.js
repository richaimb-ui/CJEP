const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log("Migrating database...");
  const { error } = await supabaseAdmin.rpc('exec_sql', { query: "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;" });
  
  if (error) {
    console.error("Migration Error:", error);
  } else {
    console.log("Migration successful");
  }
}

migrate();
