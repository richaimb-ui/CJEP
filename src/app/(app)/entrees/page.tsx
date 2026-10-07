import { Filter, Trash2 } from "lucide-react";
import { supabase } from "@/lib/data/supabase";
import { EntreeModal } from "@/components/ui/EntreeModal";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function EntreesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = (searchParams.q || "").toLowerCase();
  
  const { data: incomesData } = await supabase.from('incomes').select('*, contributors(firstName, lastName)').order('receivedOn', { ascending: false });
  const { data: allContributors } = await supabase.from('contributors').select('id, firstName, lastName');
  const entrees = (incomesData || []).filter(e => 
    e.ref.toLowerCase().includes(q) || 
    e.sourceName?.toLowerCase().includes(q) ||
    // @ts-ignore
    (e.contributors && `${e.contributors.firstName} ${e.contributors.lastName}`.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Entrées Financières</h1>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Rechercher une entrée (Réf, Source)..." />
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtres</span>
          </button>
          <EntreeModal contributors={allContributors || []} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 font-medium border-b border-border">
              <tr>
                <th className="pb-3 font-normal whitespace-nowrap">Date</th>
                <th className="pb-3 font-normal whitespace-nowrap">Réf.</th>
                <th className="pb-3 font-normal whitespace-nowrap">Type</th>
                <th className="pb-3 font-normal whitespace-nowrap">Source / Contributeur</th>
                <th className="pb-3 font-normal whitespace-nowrap">Montant</th>
                <th className="pb-3 font-normal whitespace-nowrap">Statut</th>
                <th className="pb-3 font-normal whitespace-nowrap">Saisi par</th>
                <th className="pb-3 font-normal text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => {
                // @ts-ignore
                const contributor = e.contributors;
                const source = contributor ? `${contributor.firstName} ${contributor.lastName}` : e.sourceName;
                
                return (
                  <tr key={e.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 text-gray-500 whitespace-nowrap">{e.receivedOn}</td>
                    <td className="py-4 font-mono text-xs text-gray-400 whitespace-nowrap">{e.ref}</td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
                        {e.type}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-foreground whitespace-nowrap">{source}</td>
                    <td className="py-4 font-bold text-green-600 dark:text-green-400 whitespace-nowrap">+{e.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="text-gray-500 text-xs font-semibold">{e.status}</span>
                    </td>
                    <td className="py-4 text-xs text-gray-400 whitespace-nowrap">{e.createdBy || "Système"}</td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <form action={async () => {
                          "use server";
                          const { deleteIncome } = await import("@/app/actions");
                          await deleteIncome(e.id);
                        }}>
                          <button type="submit" className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50" title="Annuler l'entrée">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {entrees.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Aucune entrée trouvée.
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
