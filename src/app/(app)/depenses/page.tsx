import { Filter, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/data/supabase";
import { DepenseModal } from "@/components/ui/DepenseModal";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function DepensesPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = (searchParams.q || "").toLowerCase();
  
  const { data: expensesData } = await supabase.from('expenses').select('*, students(firstName, lastName)').order('spentOn', { ascending: false });
  const depenses = (expensesData || []).filter(d => 
    d.ref.toLowerCase().includes(q) || 
    d.category.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Dépenses Financières</h1>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Rechercher une dépense (Réf, Catégorie)..." />
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtres</span>
          </button>
          <DepenseModal />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 font-medium border-b border-border">
              <tr>
                <th className="pb-3 font-normal whitespace-nowrap">Date</th>
                <th className="pb-3 font-normal whitespace-nowrap">Réf.</th>
                <th className="pb-3 font-normal whitespace-nowrap">Catégorie</th>
                <th className="pb-3 font-normal whitespace-nowrap">Bénéficiaire / Motif</th>
                <th className="pb-3 font-normal whitespace-nowrap">Montant</th>
                <th className="pb-3 font-normal whitespace-nowrap">Statut</th>
                <th className="pb-3 font-normal whitespace-nowrap">Saisi par</th>
                <th className="pb-3 font-normal text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {depenses.map((d) => {
                // @ts-ignore
                const student = d.students;
                const displayBeneficiary = student ? `${student.firstName} ${student.lastName}` : d.category;

                return (
                  <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 text-gray-500 whitespace-nowrap">{d.spentOn}</td>
                    <td className="py-4 font-mono text-xs text-gray-400 whitespace-nowrap">{d.ref}</td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-foreground whitespace-nowrap">{displayBeneficiary}</td>
                    <td className="py-4 font-bold text-red-600 dark:text-red-400 whitespace-nowrap">-{d.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.status === 'Validée' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        d.status === 'Rejetée' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-gray-400 whitespace-nowrap">{d.createdBy || "Système"}</td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {d.status === 'En attente' ? (
                          <>
                            <form action={async () => {
                              "use server";
                              const { validateExpense } = await import("@/app/actions");
                              await validateExpense(d.id);
                            }}>
                              <button type="submit" className="text-gray-400 hover:text-green-600 p-2 transition-colors rounded-lg hover:bg-green-50" title="Valider">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </form>
                            <form action={async () => {
                              "use server";
                              const { rejectExpense } = await import("@/app/actions");
                              await rejectExpense(d.id);
                            }}>
                              <button type="submit" className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50" title="Rejeter">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Traitée</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {depenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Aucune dépense trouvée.
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
