import { Filter } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { YearSelector } from "@/components/ui/YearSelector";
import { SearchInput } from "@/components/ui/SearchInput";

export default async function CotisationsPage(props: { searchParams: Promise<{ annee?: string, q?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear().toString();
  const year = searchParams.annee || currentYear;
  const q = (searchParams.q || "").toLowerCase();
  const currentDate = new Date();
  
  const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  
  const { data: contributorsData } = await supabase.from('contributors').select('*');
  const { data: pledgesData } = await supabase.from('pledges').select('*');
  const { data: incomesData } = await supabase.from('incomes').select('*').eq('type', 'Cotisation').eq('status', 'Actif');
  
  const pledges = pledgesData || [];
  const allIncomes = incomesData || [];

  const data = (contributorsData || [])
    .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q))
    .map(c => {
    const pledge = pledges.find(p => p.contributorId === c.id);
    const incomes = allIncomes.filter(i => i.contributorId === c.id);
    
    const status = mois.map((_, i) => {
      const monthStr = String(i + 1).padStart(2, '0');
      const isPaid = incomes.some(inc => inc.receivedOn.startsWith(`${year}-${monthStr}`));
      
      if (isPaid) return "ok";
      
      const checkDate = new Date(parseInt(year), i, 1);
      if (pledge && checkDate < currentDate) {
        return "late";
      }
      return "pending";
    });

    return {
      id: c.id,
      nom: `${c.firstName} ${c.lastName}`,
      status
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Matrice des Cotisations</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <YearSelector />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filtres</span>
          </button>
          <SearchInput placeholder="Rechercher..." />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
        {/* On force le défilement horizontal */}
        <div className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-gray-400 font-medium bg-gray-50/50 dark:bg-gray-800/20">
              <tr>
                {/* Colonne figée à gauche */}
                <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-border py-4 px-4 min-w-[140px] md:min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Contributeur
                </th>
                {mois.map((m) => (
                  <th key={m} className="border-b border-border py-4 px-2 min-w-[50px] text-center font-normal">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="sticky left-0 z-10 bg-card border-b border-border/50 py-3 px-4 font-semibold text-foreground shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {row.nom}
                  </td>
                  {row.status.map((s, i) => (
                    <td key={i} className="py-3 px-2 text-center">
                      <div className="flex justify-center">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          s === 'ok' ? 'bg-green-100 text-green-600' :
                          s === 'late' ? 'bg-red-100 text-red-500' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {s === 'ok' && '✓'}
                          {s === 'late' && '!'}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
