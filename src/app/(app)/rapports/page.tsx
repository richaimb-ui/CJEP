"use client";

import { Download, FileText, Calendar, ChevronDown, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/data/supabase";
import { generateMonthlyReport, generateContributorReport } from "@/lib/pdf";

export default function RapportsPage() {
  const [contributors, setContributors] = useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Octobre 2026");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('contributors').select('id, firstName, lastName').then(({ data }) => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Rapports & Exports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rapport Mensuel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Rapport Mensuel (PDF)</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Générez un rapport détaillé du mois incluant les soldes, les entrées, les dépenses et les indicateurs clés de performance.
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
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Générer
            </button>
          </div>
        </div>

        {/* Relevé par Contributeur */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Relevé de Cotisations</h3>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Générez un récapitulatif annuel ou mensuel des paiements effectués par un contributeur spécifique.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1" ref={dropdownRef}>
              <div 
                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="truncate text-gray-700">
                  {selectedIds.length === 0 
                    ? "Sélectionner un ou plusieurs contributeurs..." 
                    : `${selectedIds.length} sélectionné(s)`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-lg z-50 p-2 max-h-64 overflow-y-auto">
                  <div className="sticky top-0 bg-white pb-2 mb-2 border-b border-gray-100">
                    <input 
                      type="text" 
                      placeholder="Rechercher par nom..." 
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div className="space-y-1">
                    {[{ id: "ALL_JOSEPHS", firstName: "Tous les", lastName: "Josephs" }, ...contributors]
                      .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()))
                      .map(c => {
                        const isSelected = selectedIds.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                            <div className={`w-4 h-4 flex items-center justify-center rounded border ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary/50'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedIds(selectedIds.filter(id => id !== c.id));
                                } else {
                                  setSelectedIds([...selectedIds, c.id]);
                                }
                              }}
                              className="hidden"
                            />
                            <span className="text-sm font-medium text-gray-700">{c.firstName} {c.lastName}</span>
                          </label>
                        );
                    })}
                    {[{ id: "ALL_JOSEPHS", firstName: "Tous les", lastName: "Josephs" }, ...contributors].filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())).length === 0 && (
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
                  idsToGenerate = contributors
                    .filter(c => c.firstName === "Joseph")
                    .map(c => c.id);
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
              className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Générer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
