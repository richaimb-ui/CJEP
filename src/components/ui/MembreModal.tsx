"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createUser } from "@/app/actions";

export function MembreModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createUser(formData);
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
        <span className="hidden md:inline">Ajouter</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Nouveau Membre</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Nom complet</label>
                <input type="text" name="name" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                <input type="email" name="email" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Rôle</label>
                <select name="role" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required>
                  <option value="Membre">Membre</option>
                  <option value="Admin">Admin</option>
                  <option value="Observateur">Observateur</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Les observateurs ont uniquement un accès en lecture au tableau de bord.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Mot de passe temporaire</label>
                <input type="text" name="password" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: temporaire123" />
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
