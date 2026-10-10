"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createStudent } from "@/app/actions";

export function EtudiantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createStudent(formData);
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
        <span className="hidden md:inline">Nouveau</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-border">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border flex-shrink-0 bg-card">
              <h2 className="text-lg font-bold text-foreground">Nouvel Étudiant</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Nom Complet</label>
                <input type="text" name="fullName" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">École</label>
                <input type="text" name="school" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Programme</label>
                <input type="text" name="program" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Cohorte (Ex: 2024-2027)</label>
                <input type="text" name="cohort" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              </div>
              <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm">
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
