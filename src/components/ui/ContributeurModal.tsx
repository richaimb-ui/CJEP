"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createContributor } from "@/app/actions";

export function ContributeurModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createContributor(formData);
      if (res && !res.success && res.error) {
        toast.error(`Erreur : ${res.error}`);
        return;
      }
      toast.success("Contributeur enregistré avec succès !");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du contributeur.");
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
        <span className="hidden md:inline">Nouveau</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-border">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border flex-shrink-0 bg-card">
              <h2 className="text-lg font-bold text-foreground">Nouveau Contributeur</h2>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-foreground p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      required 
                      placeholder="Ex: Jean"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      required 
                      placeholder="Ex: Dupont"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-xs font-normal text-gray-400">(optionnel)</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="jean.dupont@email.com"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone <span className="text-xs font-normal text-gray-400">(optionnel)</span></label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+225 0123456789"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Engagement mensuel (FCFA)</label>
                  <input 
                    type="number" 
                    name="engagement" 
                    min="0" 
                    defaultValue="0" 
                    step="500"
                    placeholder="Ex: 500"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Montant récurrent de la cotisation mensuelle promise (ex: 500, 1 000 FCFA...).</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Enregistrer le contributeur</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
