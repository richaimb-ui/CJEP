const fs = require('fs');
let c = fs.readFileSync('src/app/actions.ts', 'utf8');
c = c.replace('import { supabase } from "@/lib/data/supabase";', 'import { createClient } from "@/utils/supabase/server";\nconst getSupabase = () => createClient();');
c = c.replace(/supabase\./g, '(await getSupabase()).');
fs.writeFileSync('src/app/actions.ts', c);

const pages = [
  'src/app/(app)/tableau-de-bord/page.tsx',
  'src/app/(app)/contributeurs/page.tsx',
  'src/app/(app)/etudiants/page.tsx',
  'src/app/(app)/entrees/page.tsx',
  'src/app/(app)/depenses/page.tsx',
  'src/app/(app)/cotisations/page.tsx',
  'src/app/(app)/rapports/page.tsx'
];
for(const f of pages) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('import { supabase } from "@/lib/data/supabase"')) {
      content = content.replace('import { supabase } from "@/lib/data/supabase";', 'import { createClient } from "@/utils/supabase/server";');
      content = content.replace(/export default async function (\w+)\(\) \{/, 'export default async function $1() {\n  const supabase = await createClient();');
      fs.writeFileSync(f, content);
      console.log('Updated ' + f);
    }
  }
}
