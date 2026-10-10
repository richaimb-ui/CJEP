"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createIncome } from "@/app/actions";

export function EntreeModal({ contributors = [] }: { contributors?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [type, setType] = useState("Cotisation");
  const [startMonth, setStartMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthsCount, setMonthsCount] = useState(1);

  async function handleSubmit(formData: FormData) {
    if (type === "Cotisation") {
      formData.set("startMonth", startMonth);
      formData.set("monthsCount", monthsCount.toString());
    }

    setIsPending(true);
    try {
      await createIncome(formData);
      setIsOpen(false);
      setStartMonth(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      });
      setMonthsCount(1);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden md:inline">Nouvelle</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Nouvelle Entrée</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Type d'entrée</label>
                <select 
                  name="type" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  required
                >
                  <option value="Cotisation">Cotisation</option>
                  <option value="Don">Don ponctuel</option>
                  <option value="Collecte">Collecte</option>
                  <option value="Subvention">Subvention</option>
                </select>
              </div>

              {type === "Cotisation" ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Contributeur</label>
                    <select name="contributorId" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">Sélectionner un contributeur...</option>
                      {contributors.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Mois de départ</label>
                      <input 
                        type="month" 
                        name="startMonth"
                        required 
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Nombre de mois</label>
                      <input 
                        type="number" 
                        name="monthsCount"
                        min="1" 
                        required 
                        value={monthsCount}
                        onChange={(e) => setMonthsCount(Number(e.target.value))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Source / Donateur</label>
                  <input type="text" name="sourceName" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">
                  Montant total (FCFA)
                </label>
                <input 
                  type="number" 
                  name="amount" 
                  min="1" 
                  step="any"
                  placeholder="Ex: 500"
                  required 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
                {type === "Cotisation" && monthsCount > 1 && (
                  <p className="text-xs text-gray-400 mt-1">Le montant sera divisé par {monthsCount} mois.</p>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-gray-500 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
