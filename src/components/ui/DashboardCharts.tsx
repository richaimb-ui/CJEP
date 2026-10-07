"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DashboardBarChart, DashboardPieChart } from "./Charts";
import { type Income, type Expense } from "@/lib/domain/models";

type DashboardChartsProps = {
  incomes: Income[];
  expenses: Expense[];
};

export function DashboardCharts({ incomes, expenses }: DashboardChartsProps) {
  const [timeframe, setTimeframe] = useState<"Semaine" | "Mois" | "Année">("Année");

  const now = new Date();
  let groupedData: { name: string; entrees: number; depenses: number }[] = [];

  if (timeframe === "Année") {
    groupedData = Array.from({ length: 12 }, (_, i) => {
      const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"][i];
      const moisIndex = String(i + 1).padStart(2, '0');
      
      const moisIncomes = incomes.filter(inc => inc.receivedOn && inc.receivedOn.includes(`-${moisIndex}-`));
      const moisExpenses = expenses.filter(exp => exp.spentOn && exp.spentOn.includes(`-${moisIndex}-`));

      return {
        name: mois,
        entrees: moisIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        depenses: moisExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });
  } else if (timeframe === "Mois") {
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthIncomes = incomes.filter(inc => inc.receivedOn && inc.receivedOn.startsWith(currentMonthPrefix));
    const thisMonthExpenses = expenses.filter(exp => exp.spentOn && exp.spentOn.startsWith(currentMonthPrefix));

    groupedData = Array.from({ length: 4 }, (_, i) => {
      const startDay = i * 7 + 1;
      const endDay = i === 3 ? 31 : (i + 1) * 7;
      
      const weekIncomes = thisMonthIncomes.filter(inc => {
        const day = parseInt(inc.receivedOn.split("-")[2], 10);
        return day >= startDay && day <= endDay;
      });
      const weekExpenses = thisMonthExpenses.filter(exp => {
        const day = parseInt(exp.spentOn.split("-")[2], 10);
        return day >= startDay && day <= endDay;
      });

      return {
        name: `S. ${i + 1}`,
        entrees: weekIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        depenses: weekExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });
  } else if (timeframe === "Semaine") {
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday);
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });

    const displayJours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    groupedData = displayJours.map((jour, i) => {
      const targetDate = weekDates[i];
      const dayIncomes = incomes.filter(inc => inc.receivedOn === targetDate);
      const dayExpenses = expenses.filter(exp => exp.spentOn === targetDate);
      
      return {
        name: jour,
        entrees: dayIncomes.reduce((sum, inc) => sum + inc.amount, 0),
        depenses: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });
  }

  // Regroupement pour les catégories (Pie Chart)
  const categoryMap = new Map<string, number>();
  expenses.forEach(exp => {
    const cat = exp.category || "Divers";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + exp.amount);
  });
  
  const pieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  // S'il n'y a pas de données pour le PieChart
  if (pieData.length === 0) {
    pieData.push({ name: "Aucune dépense", value: 1 });
  }

  const handleExport = () => {
    alert("Export en cours de génération... Le téléchargement démarrera sous peu.");
  };

  return (
    <>
      {/* Entrées et Dépenses (Bar Chart) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Entrées et Dépenses</h3>
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as "Semaine" | "Mois" | "Année")}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="Année">Année</option>
            <option value="Mois">Mois</option>
            <option value="Semaine">Semaine</option>
          </select>
        </div>
        <div className="h-64">
          <DashboardBarChart data={groupedData} />
        </div>
        <div className="flex items-center justify-end gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Entrées</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-border"></span> Dépenses</div>
        </div>
      </div>

      {/* Répartition des dépenses (Pie Chart) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Répartition des dépenses</h3>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            Exporter <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="h-64 flex items-center justify-center">
          <DashboardPieChart data={pieData} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-gray-500">
          {pieData.map((d, i) => (
             <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#4f3ff0', '#a199ff', '#c7c2ff', '#e0ddff', '#f5f4ff'][i % 5] }}></span>
                {d.name}
             </div>
          ))}
        </div>
      </div>
    </>
  );
}
