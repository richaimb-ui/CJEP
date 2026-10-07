"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createExpense } from "@/app/actions";

export function DepenseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("Frais de scolarité");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createExpense(formData);
      setIsOpen(false);
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Nouvelle Dépense</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Catégorie</label>
                <select 
                  name="category" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  required
                >
                  <option value="Frais de scolarité">Frais de scolarité</option>
                  <option value="Inscription">Inscription</option>
                  <option value="Santé">Santé</option>
                  <option value="Loyer">Loyer</option>
                  <option value="Restauration">Restauration</option>
                  <option value="Transport">Transport</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              
              {category === "Divers" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Préciser la catégorie</label>
                  <input type="text" name="customCategory" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Achat matériel..." />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Montant (FCFA)</label>
                <input type="number" name="amount" min="1" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Bénéficiaire / Étudiant</label>
                <input type="text" name="beneficiary" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
