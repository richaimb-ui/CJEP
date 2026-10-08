import { AppShell } from "@/components/ui/AppShell";
import { createClient } from "@/utils/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  
  let currentUser = null;
  if (userId) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
    currentUser = userData;
  }
  
  const { data: orgData } = await supabase.from('organization').select('name').limit(1).maybeSingle();
  const orgName = orgData?.name || "COMITÉ JOSEPH";

  return (
    <AppShell orgName={orgName} user={currentUser}>
      {children}
    </AppShell>
  );
}
