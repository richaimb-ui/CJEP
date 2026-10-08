"use client";

import { useState } from "react";
import { Plus, X, Edit, Phone, Mail } from "lucide-react";
import { createUser, updateUser } from "@/app/actions";
import type { User } from "@/lib/domain/models";

export function MembreModal({ user }: { user?: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isEdit = !!user;

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      if (isEdit) {
        formData.append("id", user.id);
        await updateUser(formData);
      } else {
        await createUser(formData);
      }
      setIsOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  const [sharePassword, setSharePassword] = useState("Cjep2026!");

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !user.phone) return;
    const pwdText = sharePassword ? `\nMot de passe temporaire : ${sharePassword}\n\n🚨 Ce mot de passe est à usage unique. Il vous sera demandé de le changer impérativement lors de votre première connexion.` : `\nVotre mot de passe vous a été communiqué par l'administrateur.`;
    const message = `Bonjour ${user.name},\nVoici vos informations de connexion pour le tableau de bord CJEP.\nLien: https://cjep.org\nEmail: ${user.email}${pwdText}`;
    const url = `https://wa.me/${user.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    const pwdText = sharePassword ? `\nMot de passe temporaire : ${sharePassword}\n\n🚨 Ce mot de passe est à usage unique. Il vous sera demandé de le changer impérativement lors de votre première connexion.` : `\nVotre mot de passe vous a été communiqué par l'administrateur.`;
    const subject = `Vos accès CJEP`;
    const body = `Bonjour ${user.name},\nVoici vos informations de connexion pour le tableau de bord CJEP.\nLien: https://cjep.org\nEmail: ${user.email}${pwdText}`;
    const url = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {isEdit ? (
        <button onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-primary transition-opacity mr-3" title="Modifier">
          <Edit className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Ajouter</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Modifier Membre' : 'Nouveau Membre'}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Nom complet</label>
                <input type="text" name="name" defaultValue={user?.name || ''} required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Email</label>
                <input type="email" name="email" defaultValue={user?.email || ''} readOnly={isEdit} required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {isEdit && <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Téléphone</label>
                <input type="tel" name="phone" defaultValue={user?.phone || ''} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="+225 0123456789" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">Rôle</label>
                <select name="role" defaultValue={user?.role || 'Membre'} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required>
                  <option value="Membre">Membre</option>
                  <option value="Admin">Admin</option>
                  <option value="Observateur">Observateur</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Les observateurs ont uniquement un accès en lecture au tableau de bord.</p>
              </div>
              {!isEdit && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">Mot de passe par défaut</label>
                  <input type="text" name="password" defaultValue="Cjep2026!" required className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <p className="text-[10px] text-gray-400 mt-1">Le membre sera forcé de le changer à la première connexion.</p>
                </div>
              )}
              
              {isEdit && (
                <div className="pt-2 border-t border-border mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Partager les accès</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe à inclure (optionnel)</label>
                      <input 
                        type="text" 
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                        placeholder="Ex: temporaire123" 
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Si renseigné, le message précisera que ce mot de passe est à usage unique.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleShareWhatsApp} disabled={!user?.phone} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 disabled:opacity-50 transition-colors">
                        <Phone className="w-4 h-4" /> WhatsApp
                      </button>
                      <button onClick={handleShareEmail} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
                        <Mail className="w-4 h-4" /> Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
