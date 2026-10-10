/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ContributeurModal } from "@/components/ui/ContributeurModal";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function ContributeursPage(props: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const q = (searchParams.q || "").toLowerCase();
  
  const { data: contributeursData } = await supabase.from('contributors').select('*');
  const contributeurs = (contributeursData || []).filter((c: any) => 
    c.firstName.toLowerCase().includes(q) || 
    c.lastName.toLowerCase().includes(q)
  );

  const { data: pledgesData } = await supabase.from('pledges').select('*');
  const pledges = pledgesData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">Contributeurs</h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <SearchInput placeholder="Rechercher un contributeur..." />
          <button title="Filtres avancés" className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtres</span>
          </button>
          <ContributeurModal />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 font-medium border-b border-border">
              <tr>
                <th className="pb-3 font-normal whitespace-nowrap">Contributeur</th>
                <th className="pb-3 font-normal whitespace-nowrap">Contact</th>
                <th className="pb-3 font-normal whitespace-nowrap">Engagement Mensuel</th>
                <th className="pb-3 font-normal whitespace-nowrap">Statut</th>
                <th className="pb-3 font-normal text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributeurs.map((c: any) => {
                const pledge = pledges.find((p: any) => p.contributorId === c.id);
                const engagement = pledge ? pledge.monthlyAmount : 0;
                
                // For now, mock the status
                const statut = "À jour";

                return (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">
                          {c.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-500">Inscrit le {c.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <p className="text-gray-700 dark:text-gray-300">{c.phone || "-"}</p>
                      <p className="text-xs text-gray-500">{c.email || "-"}</p>
                    </td>
                    <td className="py-4 font-semibold whitespace-nowrap">
                      {engagement > 0 ? `${engagement.toLocaleString('fr-FR')} FCFA` : <span className="text-gray-400 italic font-normal">Ponctuel</span>}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {statut}
                      </span>
                    </td>
                    <td className="py-4 whitespace-nowrap text-right">
                      <form action={async () => {
                        "use server";
                        const { deleteContributor } = await import("@/app/actions");
                        await deleteContributor(c.id);
                      }}>
                        <button type="submit" className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {contributeurs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucun contributeur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
