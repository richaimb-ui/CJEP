"use client";

import { useState } from "react";
import { Plus, X, Edit, Phone, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUser, updateUser } from "@/app/actions";
import type { User } from "@/lib/domain/models";

export function MembreModal({ user }: { user?: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isEdit = !!user;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (isEdit) {
        formData.append("id", user.id);
        const res = await updateUser(formData);
        if (res && !res.success && res.error) {
          toast.error(`Erreur : ${res.error}`);
          return;
        }
        toast.success("Informations du membre mises à jour !");
      } else {
        const res = await createUser(formData);
        if (res && !res.success && res.error) {
          toast.error(`Erreur : ${res.error}`);
          return;
        }
        toast.success("Nouveau membre ajouté avec succès !");
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsPending(false);
    }
  }

  const [sharePassword, setSharePassword] = useState("Cjep2026!");

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !user.phone) return;
    const pwdText = sharePassword 
      ? `\n🔑 Mot de passe temporaire : ${sharePassword}\n\n🚨 Note de sécurité : Ce mot de passe est à usage unique. Il vous sera demandé de définir votre mot de passe personnel dès votre première connexion.` 
      : `\nVotre mot de passe vous a été communiqué par l'administrateur.`;
    const message = `Bonjour ${user.name},\n\nC'est avec une grande joie que nous vous accueillons au sein du Comité Joseph ! Votre engagement à nos côtés est précieux pour notre mission.\n\nVoici vos accès à la plateforme :\n🌐 Lien d'accès : https://www.rezocjep.net/login\n📧 Email : ${user.email}${pwdText}\n\nBienvenue parmi nous ! ✨\n— L'équipe du Comité Joseph`;
    const url = `https://wa.me/${user.phone.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    const pwdText = sharePassword 
      ? `\n🔑 Mot de passe temporaire : ${sharePassword}\n\n🚨 Note de sécurité : Ce mot de passe est à usage unique. Il vous sera demandé de définir votre mot de passe personnel dès votre première connexion.` 
      : `\nVotre mot de passe vous a été communiqué par l'administrateur.`;
    const subject = `Bienvenue au sein du Comité Joseph - Vos accès à la plateforme`;
    const body = `Bonjour ${user.name},\n\nC'est avec un réel enthousiasme que nous vous souhaitons la bienvenue au sein du Comité Joseph.\n\nVotre présence et votre engagement à nos côtés sont précieux pour accomplir notre mission d'accompagnement et de soutien.\n\nVoici vos accès à notre espace de gestion :\n👉 Lien d'accès : https://www.rezocjep.net/login\n👉 Identifiant (Email) : ${user.email}${pwdText}\n\nNous nous réjouissons de cette belle collaboration à venir.\n\nFraternellement,\nL'équipe du Comité Joseph`;
    const url = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {isEdit ? (
        <button 
          type="button"
          onClick={() => setIsOpen(true)} 
          className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-1" 
          title="Modifier ce membre"
        >
          <Edit className="w-4 h-4" />
        </button>
      ) : (
        <button 
          type="button"
          onClick={() => setIsOpen(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Ajouter</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-border">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border flex-shrink-0 bg-card">
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? 'Modifier les informations du Membre' : 'Nouveau Membre'}
              </h2>
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={user?.name || ''} 
                    required 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={user?.email || ''} 
                    readOnly={isEdit} 
                    required 
                    className={`w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${isEdit ? 'opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : ''}`} 
                  />
                  {isEdit && <p className="text-xs text-gray-400 mt-1">L'adresse email est l'identifiant de connexion et ne peut être modifiée.</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    defaultValue={user?.phone || ''} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="+225 0123456789" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <select 
                    name="role" 
                    defaultValue={user?.role || 'Membre'} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    required
                  >
                    <option value="Membre">Membre</option>
                    <option value="Admin">Admin</option>
                    <option value="Observateur">Observateur</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Les observateurs ont uniquement un accès en lecture au tableau de bord.</p>
                </div>

                {!isEdit && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mot de passe par défaut</label>
                    <input 
                      type="text" 
                      name="password" 
                      defaultValue="Cjep2026!" 
                      required 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Le membre sera forcé de le changer à la première connexion.</p>
                  </div>
                )}
                
                {isEdit && (
                  <div className="pt-3 border-t border-border mt-2">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Partager les accès</h3>
                    <div className="space-y-3 bg-gray-50/70 dark:bg-gray-800/30 p-3 rounded-xl border border-border/50">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe à inclure (optionnel)</label>
                        <input 
                          type="text" 
                          value={sharePassword}
                          onChange={(e) => setSharePassword(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                          placeholder="Ex: temporaire123" 
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Si renseigné, le message précisera que ce mot de passe est à usage unique.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={handleShareWhatsApp} 
                          disabled={!user?.phone} 
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-green-500 text-green-600 rounded-xl text-xs sm:text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50 transition-colors"
                        >
                          <Phone className="w-4 h-4" /> WhatsApp
                        </button>
                        <button 
                          type="button"
                          onClick={handleShareEmail} 
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-primary text-primary rounded-xl text-xs sm:text-sm font-medium hover:bg-primary/5 transition-colors"
                        >
                          <Mail className="w-4 h-4" /> Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer: Always visible and never cut off */}
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
                    <span>{isEdit ? "Enregistrer les modifications" : "Enregistrer"}</span>
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
