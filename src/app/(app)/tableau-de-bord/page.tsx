import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Search, Download, Plus, Wallet, CreditCard, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getDashboardStats } from "@/lib/domain/finance";
import { DashboardCharts } from "@/components/ui/DashboardCharts";

export default async function Dashboard() {
  const stats = await getDashboardStats();
  const dateStr = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground capitalize">Nous sommes {dateStr}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Tableau de bord</h1>
            <Badge variant="secondary" className="bg-white border-border text-[10px] sm:text-xs text-muted-foreground font-normal mt-1 sm:mt-0">
              MàJ: il y a 6 secondes
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un membre..." 
              className="pl-8 bg-white border-border"
            />
          </div>
        </div>
      </div>

      {/* Overview section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-primary">Votre vue d&apos;ensemble</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Chiffres à consulter</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button className="text-xs sm:text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors flex-1 sm:flex-none justify-center border sm:border-none border-border rounded-md py-1.5 sm:py-0">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Voir l&apos;analyse détaillée</span>
              <span className="sm:hidden">Analyse</span>
            </button>
            <div className="flex items-center gap-2 bg-white border border-border rounded-md p-1 px-3 flex-1 sm:flex-none justify-between sm:justify-start">
              <span className="text-xs sm:text-sm text-muted-foreground hidden xs:inline">Période:</span>
              <select className="text-xs sm:text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full sm:w-auto cursor-pointer">
                <option>Ce mois</option>
                <option>Cette semaine</option>
                <option>Cette année</option>
              </select>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-white w-full sm:w-auto">
              Exporter <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-border bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Entrée totale</p>
              <div className="flex items-end gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary break-words w-full sm:w-auto">{formatCFA(stats.totalIncomes)}</h3>
                <span className="flex items-center text-xs font-medium text-blue-600 mb-1 w-full sm:w-auto">
                  Global
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Solde en caisse</p>
              <div className="flex items-end gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary break-words w-full sm:w-auto">{formatCFA(stats.currentBalance)}</h3>
                <span className="flex items-center text-xs font-medium text-emerald-600 mb-1 w-full sm:w-auto">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +22%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Cotisations ce mois</p>
              <div className="flex items-end gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary break-words w-full sm:w-auto">{formatCFA(stats.thisMonthIncomes)}</h3>
                <span className="flex items-center text-xs font-medium text-emerald-600 mb-1 w-full sm:w-auto">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +12%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Banknote className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Dépenses ce mois</p>
              <div className="flex items-end gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary break-words w-full sm:w-auto">{formatCFA(stats.thisMonthExpenses)}</h3>
                <span className="flex items-center text-xs font-medium text-destructive mb-1 w-full sm:w-auto">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +5%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DashboardCharts incomes={stats.rawIncomes} expenses={stats.rawExpenses} />
        </div>
      </div>

      {/* Table section */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Membres en retard</h2>
            <p className="text-sm text-muted-foreground">À relancer aujourd&apos;hui</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/entrees" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Enregistrer un paiement
            </a>
            <Button variant="outline" className="gap-2 bg-white">
              Filtrer <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Nom du membre</th>
                <th className="px-6 py-4 font-medium">Date d&apos;engagement</th>
                <th className="px-6 py-4 font-medium">Groupe</th>
                <th className="px-6 py-4 font-medium">Montant dû</th>
                <th className="px-6 py-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.lateContributors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun membre en retard.
                  </td>
                </tr>
              ) : (
                stats.lateContributors.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{c.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">--</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.role}</td>
                    <td className="px-6 py-4 font-medium">{formatCFA(c.amountOwed)}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium rounded-full">
                        {c.monthsStr}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
