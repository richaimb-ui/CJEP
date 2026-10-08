"use client";

import { Wallet, ChevronDown, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export function DashboardMobileHeader({ 
  currentBalance, 
  totalIncomes, 
  thisMonthIncomes,
  thisYearIncomes,
  thisWeekIncomes
}: { 
  currentBalance: number;
  totalIncomes: number;
  thisMonthIncomes: number;
  thisYearIncomes: number;
  thisWeekIncomes: number;
}) {
  const [timeframe, setTimeframe] = useState<"Total" | "Année" | "Mois" | "Semaine">("Total");

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  let displayedIncome = totalIncomes;
  if (timeframe === "Année") displayedIncome = thisYearIncomes;
  if (timeframe === "Mois") displayedIncome = thisMonthIncomes;
  if (timeframe === "Semaine") displayedIncome = thisWeekIncomes;

  return (
    <div className="md:hidden flex flex-col items-center mt-2 mb-6">
      <div className="bg-white text-gray-700 px-4 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-2 mb-6 shadow-sm border border-gray-100">
        <Wallet className="w-3.5 h-3.5 text-blue-600" />
        Compte Principal
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
      </div>
      
      {/* Solde Principal */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-sm text-gray-500 font-medium mb-1">Solde Actuel</p>
        <h2 className="text-[40px] leading-none font-extrabold tracking-tight text-gray-900 flex items-baseline">
          {new Intl.NumberFormat('fr-FR').format(currentBalance)}
          <span className="text-xl text-gray-400 font-semibold ml-1">F</span>
        </h2>
      </div>

      {/* Distinction Entrées avec Sélecteur */}
      <div className="bg-white border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full rounded-2xl p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="text-emerald-600 font-bold text-lg leading-tight">
            +{formatCFA(displayedIncome)}
          </p>
          <p className="text-xs text-gray-400 font-medium">Entrées</p>
        </div>
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as "Total" | "Année" | "Mois" | "Semaine")}
          className="px-3 py-1.5 border border-gray-100 rounded-lg text-xs bg-gray-50 focus:outline-none focus:ring-0 cursor-pointer text-gray-600 font-medium"
        >
          <option value="Total">Total Global</option>
          <option value="Année">Cette année</option>
          <option value="Mois">Ce mois</option>
          <option value="Semaine">Cette semaine</option>
        </select>
      </div>

      <div className="flex items-center gap-3 w-full">
        <Link href="/entrees" className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-semibold text-[15px] shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)]">
            <Plus className="w-5 h-5 mr-1" />
            Ajouter
          </Button>
        </Link>
        <Link href="/depenses" className="flex-1">
          <Button variant="secondary" className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-2xl h-14 font-semibold text-[15px] border-none shadow-none">
            <ArrowUpRight className="w-5 h-5 mr-1" />
            Dépenser
          </Button>
        </Link>
      </div>
    </div>
  );
}
