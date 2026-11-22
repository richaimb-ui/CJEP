"use client";

import { Download, FileText, Calendar, ChevronDown, Check, Users, Sparkles } from "lucide-react";
import { useEffect, useState, useRef, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { generateMonthlyReport, generateContributorReport } from "@/lib/pdf";
import { ContributorReportGenerator } from "@/components/ui/ContributorReportGenerator";

export default function RapportsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"contributors" | "standard">("contributors");
  const [contributors, setContributors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Octobre 2026");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("contributors").select("id, firstName, lastName").then(({ data }) => {
      if (data) setContributors(data);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Rapports & Exports
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Générez et téléchargez des rapports officiels pour les contributeurs, les cotisations et l'activité mensuelle.
          </p>
        </div>

        {/* Sélecteur d'onglets */}
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab("contributors")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === "contributors"
                ? "bg-card text-foreground shadow-xs"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 text-primary" />
            <span>Rapports Contributeurs</span>
            <span className="hidden sm:inline bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Sur-mesure
            </span>
          </button>

          <button
            onClick={() => setActiveTab("standard")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === "standard"
                ? "bg-card text-foreground shadow-xs"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Rapports Périodiques</span>
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === "contributors" ? (
        <ContributorReportGenerator />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rapport Mensuel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Rapport Mensuel (PDF)</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Générez un rapport financier détaillé du mois incluant les soldes, les entrées, les dépenses et les indicateurs clés de performance.
            </p>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Octobre 2026</option>
                <option>Septembre 2026</option>
                <option>Août 2026</option>
              </select>
              <button
                onClick={() => {
                  generateMonthlyReport(selectedMonth);
                }}
                className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Générer
              </button>
            </div>
          </div>

          {/* Relevé simple de cotisations */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Relevé Rapide de Cotisations</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Générez un récapitulatif annuel ou mensuel des paiements effectués par un ou plusieurs contributeurs spécifiques.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1" ref={dropdownRef}>
                <div
                  className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {selectedIds.length === 0
                      ? "Sélectionner un ou plusieurs contributeurs..."
                      : `${selectedIds.length} sélectionné(s)`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
                    <div className="sticky top-0 bg-card pb-2 mb-2 border-b border-border">
                      <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="space-y-1">
                      {[{ id: "ALL_JOSEPHS", firstName: "Tous les", lastName: "Josephs" }, ...contributors]
                        .filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()))
                        .map((c) => {
                          const isSelected = selectedIds.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors group"
                            >
                              <div
                                className={`w-4 h-4 flex items-center justify-center rounded border ${
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-gray-300 group-hover:border-primary/50"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setSelectedIds(selectedIds.filter((id) => id !== c.id));
                                  } else {
                                    setSelectedIds([...selectedIds, c.id]);
                                  }
                                }}
                                className="hidden"
                              />
                              <span className="text-sm font-medium text-foreground">
                                {c.firstName} {c.lastName}
                              </span>
                            </label>
                          );
                        })}
                      {[{ id: "ALL_JOSEPHS", firstName: "Tous les", lastName: "Josephs" }, ...contributors].filter(
                        (c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-gray-500">
                          Aucun résultat trouvé.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  let idsToGenerate = selectedIds;
                  if (selectedIds.includes("ALL_JOSEPHS")) {
                    idsToGenerate = contributors.filter((c) => c.firstName === "Joseph").map((c) => c.id);
                    if (idsToGenerate.length === 0) {
                      alert("Aucun Joseph trouvé.");
                      return;
                    }
                  }

                  if (idsToGenerate.length === 0) {
                    alert("Veuillez sélectionner au moins un contributeur.");
                    return;
                  }

                  generateContributorReport(idsToGenerate);
                }}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Générer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
