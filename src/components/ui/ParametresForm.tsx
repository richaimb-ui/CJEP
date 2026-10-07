"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { updateSettings } from "@/app/actions";

export function ParametresForm({ settings }: { settings: any }) {
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setShowSuccess(false);
    try {
      await updateSettings(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-8 relative">
      {showSuccess && (
        <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 shadow-sm animate-fade-in-down">
          Paramètres enregistrés !
        </div>
      )}
      
      <section>
        <h2 className="text-lg font-bold mb-4">Informations Générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Nom de l'organisation</label>
            <input type="text" name="name" defaultValue={settings.name} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Devise principale</label>
            <input type="text" defaultValue={settings.currency} disabled className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2 text-sm text-gray-400 cursor-not-allowed" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Gestion des Cotisations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Jour limite du mois</label>
            <div className="flex items-center gap-2">
              <span className="text-sm">Le</span>
              <input type="number" name="dueDay" defaultValue={settings.dueDay} min={1} max={28} className="w-20 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <span className="text-sm">du mois suivant</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Solde d'ouverture initial</label>
            <input type="number" name="openingBalance" defaultValue={settings.openingBalance} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </section>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
