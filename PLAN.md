# CJEP — Plan de construction

Application de gestion financière des études pastorales : cotisations mensuelles volontaires, autres entrées, dépenses de formation, suivi des étudiants pasteurs.

---

## 1. Décisions validées

| Sujet | Décision |
|---|---|
| Devise | FCFA (XOF), montants **entiers** (pas de décimales), affichés `100 000 FCFA` |
| Portée | Une seule assemblée, schéma **prêt multi-organisations** (`organization_id` partout) |
| Utilisateurs | Comité uniquement — les contributeurs n'ont pas de compte |
| Rôles | **Admin** (tout, validation, comptes, paramètres) · **Membre** (saisie) · **Lecteur** (consultation + exports) |
| Retard | Un mois est en retard s'il n'est pas couvert à la **date limite** (ex. le 10 du mois suivant, réglable) |
| Imputation | Automatique, **du mois le plus ancien au plus récent**. Paiements partiels et avances possibles. |
| Engagements | Historisés : montant, mois de début, mois de fin éventuel |
| Étudiants | Fiche par étudiant ; une dépense peut être rattachée à un étudiant ou être générale |
| Entrées | Cotisation · Don ponctuel · Collecte/offrande · Subvention/partenaire |
| Contrôle | Journal d'audit complet, aucune suppression (annulation avec motif) ; **validation des dépenses par un admin** (auto-validation permise) |
| Paiement | Espèces · Virement bancaire (avec référence) |
| Solde | Un seul solde global = solde d'ouverture + entrées actives − dépenses validées |
| Connexion | Sur invitation, email + mot de passe, mot de passe oublié |
| Rapports | Export Excel/CSV · Rapport PDF mensuel · Relevé PDF par contributeur |
| Relances | Aucune pour l'instant (simple liste des retards) |
| Interface | Français, mode clair et sombre |
| Données | Démarrage à zéro avec un solde d'ouverture ; 100 à 500 contributeurs |
| Infra | Supabase en local (Docker 29.6 et CLI 2.119 détectés), puis Supabase Cloud et Vercel |
| Nom | CJEP |
| Catégories de dépenses par défaut | Frais de scolarité · Livres & fournitures · Transport (modifiables) |

---

## 2. Stack technique

- **Next.js 16.3** (App Router, Server Components, Server Actions). Attention aux différences de la v16 : `middleware.ts` s'appelle désormais **`proxy.ts`**, et le cache se gère via `cacheComponents` / `'use cache'`. Je consulte `node_modules/next/dist/docs/` avant chaque phase.
- **Tailwind CSS v4** (configuration dans le CSS via `@theme`, variante `dark` personnalisée)
- **Supabase** : Postgres, Auth, RLS, avec `@supabase/ssr` côté serveur
- **Zod** : validation de tous les formulaires, côté serveur
- **Recharts** (graphiques), **lucide-react** (icônes), police **Urbanist** via `next/font`, proche de la typographie de la capture
- **exceljs** (export Excel), **@react-pdf/renderer** (PDF)
- **Tests** : Vitest (logique métier), pgTAP via `supabase test db` (RLS, triggers), Playwright (bout en bout)

---

## 3. Modèle de données

Tous les montants sont stockés en `bigint` (FCFA entiers, `CHECK (amount > 0)`). Toutes les tables ont `organization_id`, `created_at`, `created_by`.

```
organizations      id, name, currency='XOF', due_day (défaut 10), timezone,
                   opening_balance, opening_date
profiles           id (= auth.users.id), organization_id, full_name, role (admin|membre|lecteur), is_active
invitations        email, role, token, expires_at, accepted_at

contributors       id, first_name, last_name, phone, email, notes, is_active
pledges            id, contributor_id, monthly_amount, start_month, end_month (null = en cours)

students           id, full_name, school, program, cohort, start_date, status (actif|diplômé|suspendu|abandon)

incomes            id, ref (ENT-2026-0001), type (cotisation|don|collecte|subvention),
                   contributor_id (obligatoire si cotisation), donor_name, amount, received_on,
                   payment_method (especes|virement), payment_reference, note,
                   status (active|cancelled), cancelled_by, cancelled_at, cancel_reason

expense_categories id, name, is_active
expenses           id, ref (DEP-2026-0001), category_id, student_id (nullable), beneficiary,
                   amount, spent_on, payment_method, payment_reference, note,
                   status (pending|validated|rejected|cancelled), reviewed_by, reviewed_at, review_note

audit_log          id, table_name, record_id, action (insert|update|cancel|validate|reject),
                   old_data jsonb, new_data jsonb, actor_id, at        ← alimenté par des triggers
```

**Règles d'intégrité côté base**
- Pas de `DELETE` (aucune policy RLS ne l'autorise) : on corrige en annulant puis en ressaisissant.
- Deux engagements d'un même contributeur ne peuvent pas se chevaucher (contrainte d'exclusion sur les périodes).
- Les références `ENT-…` et `DEP-…` sont générées par séquence, sans trou visible.
- Protection contre les doubles soumissions : chaque formulaire envoie un `idempotency_key` unique en base.

### Calcul des statuts de cotisation

C'est une fonction pure en TypeScript (`src/lib/domain/cotisations.ts`), seule source de vérité, couverte par des tests unitaires.

L'imputation « du plus ancien au plus récent » équivaut à comparer des **cumuls** : le mois *m* est couvert si le total versé depuis le début ≥ le total dû jusqu'à *m* inclus. On n'a donc rien à stocker, et l'annulation ou la correction d'un versement se répercute automatiquement.

Pour chaque contributeur, à une date donnée, on calcule :
- **À jour** : tous les mois dont la date limite est passée sont couverts
- **En retard** : au moins un mois échu n'est pas couvert, avec le nombre de mois et le montant dû
- Informations complémentaires : mois en cours partiellement payé, avance (nombre de mois d'avance)

Avec 500 contributeurs, ce calcul se fait en mémoire côté serveur, à partir de deux requêtes agrégées (engagements, versements par contributeur).

### Sécurité (RLS)

Deux fonctions utilitaires `auth_org_id()` et `auth_role()` lisent le profil de l'utilisateur connecté.

| Rôle | Lecture | Création | Modification | Valider / annuler | Comptes / paramètres |
|---|---|---|---|---|---|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Membre | ✓ | ✓ entrées, dépenses, contributeurs, étudiants | ses dépenses encore *en attente* | ✗ | ✗ |
| Lecteur | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 4. Pages et routes

```
/                              Landing page (phase 5)
/connexion  /mot-de-passe-oublie  /reinitialiser  /invitation/[token]

(app)  — barre latérale et en-tête de la capture
/tableau-de-bord               Indicateurs, graphiques, retards, dépenses à valider
/contributeurs                 Liste, recherche, filtres de statut, export
/contributeurs/nouveau
/contributeurs/[id]            Fiche : engagements, historique, grille des mois, relevé PDF
/cotisations                   Grille contributeurs × mois (vert / orange / rouge), filtre par année
/entrees  /entrees/nouvelle    Toutes les entrées, filtres par type, période et moyen de paiement
/depenses  /depenses/nouvelle
/depenses/a-valider            File de validation (admin)
/etudiants  /etudiants/[id]    Fiche et coût cumulé par étudiant
/rapports                      Rapport mensuel PDF, exports Excel/CSV
/journal                       Journal d'audit (admin)
/parametres                    Organisation, date limite, solde d'ouverture, catégories, comité et invitations
/profil
```

### Tableau de bord (adapté de la capture)

| Zone de la capture | Dans CJEP |
|---|---|
| 4 cartes d'indicateurs | **Solde actuel** · **Entrées du mois** · **Dépenses du mois** · **Taux de recouvrement** (reçu / attendu), chacune avec sa variation par rapport au mois précédent |
| « Ventas y Compras » (barres) | **Entrées et dépenses** sur 12 mois, avec un sélecteur semaine / mois / année |
| « Pago de ventas vencido » | **Contributeurs en retard** : nom, mois dus, montant dû, action « Enregistrer un versement » |
| « Pago de compra vencido » | **Dépenses en attente de validation** : actions valider / rejeter |
| « Alerta de stock » | **Dernières opérations** |
| Donut | **Répartition des dépenses par catégorie**, ou des entrées par type |
| Bouton « + » de l'en-tête | Saisie rapide : nouvelle entrée, nouvelle dépense, nouveau contributeur |

---

## 5. Phases

Chaque phase se termine par une démonstration et votre validation avant de passer à la suivante.

### Phase 0 — Fondations
- Initialiser git, la structure `src/` (`app/`, `components/ui/`, `lib/domain/`, `lib/data/`, `lib/supabase/`) et installer les dépendances
- Nettoyer le gabarit (`lang="fr"`, métadonnées)
- **Résultat attendu** : `npm run dev`, `lint` et `build` passent.

### Phase 1 — Système de design et pages
- Reprendre la capture en tokens Tailwind : violet indigo (≈ `#4F3FF0`), fonds lavande, cartes arrondies à bordure légère, typographie fine, palette sombre
- Composants : bouton, champ, select, carte d'indicateur, tableau, badge de statut, avatar à initiale, menu, modale, tiroir, état vide, squelette de chargement, toast
- Coquille de l'application : barre latérale repliable (et menu mobile), en-tête, bascule clair/sombre
- **Toutes les pages** de la section 4, avec un contenu statique
- **Résultat attendu** : la navigation fonctionne sur toutes les routes, en clair et en sombre, sur ordinateur et sur mobile.

### Phase 2 — Interactivité avec des données locales
- Couche d'accès aux données `lib/data/` derrière une interface unique, implémentée d'abord **en mémoire** à partir de données d'exemple réalistes (≈150 contributeurs, 4 étudiants, 18 mois d'historique)
- Logique métier `lib/domain/` : statuts des cotisations, solde, indicateurs, avec ses tests Vitest
- Formulaires fonctionnels (Server Actions + Zod), validation des dépenses, annulation, filtres, recherche, pagination, graphiques réels
- Exports CSV/Excel et PDF (rapport mensuel, relevé)
- **Résultat attendu** : tous les parcours fonctionnent avec les données locales et les tests unitaires passent.

### Phase 3 — Base de données Supabase et tests
- `supabase init`, puis les migrations SQL (tables, contraintes, séquences, triggers d'audit, RLS) et des données d'amorçage
- Implémentation Supabase de `lib/data/`. Le reste de l'application ne change pas.
- Tests pgTAP : RLS par rôle, interdiction de supprimer, audit, contraintes
- Pendant cette phase uniquement, une connexion de développement avec des utilisateurs d'amorçage (un par rôle). Elle est retirée en phase 4.
- **Résultat attendu** : l'application tourne sur Supabase en local et `supabase test db` passe.

### Phase 4 — Authentification
- `proxy.ts` pour une redirection rapide des visiteurs non connectés, avec une vérification réelle de la session dans chaque layout et chaque action
- Connexion, mot de passe oublié et réinitialisation, invitations par l'admin, désactivation d'un compte
- Interface adaptée au rôle : boutons masqués et actions refusées côté serveur
- **Résultat attendu** : les trois rôles sont testés de bout en bout et aucune donnée n'est accessible sans session.

### Phase 5 — Landing page
- Page publique de présentation de la mission et accès « Espace comité »
- **Résultat attendu** : la page est responsive et obtient un bon score Lighthouse.

### Phase 6 — Vérification de bout en bout et mise en ligne
- Scénarios Playwright : invitation, saisie d'un versement, changement de statut, dépense validée, mise à jour du solde, rapport PDF
- Revue de sécurité (RLS, variables d'environnement, en-têtes), accessibilité, performance
- Création du projet Supabase Cloud, migrations, dépôt GitHub, projet Vercel, variables d'environnement, domaine
- Création du premier compte admin et du solde d'ouverture
- **Résultat attendu** : l'application est en production et vous avez une courte checklist d'exploitation (sauvegardes, ajout d'un membre du comité).

---

## 6. Points à confirmer plus tard (sans impact immédiat)

1. **Fuseau horaire et pays** : nécessaires pour les dates limites et les dates du jour. Ce sera un paramètre de l'organisation ; il me faudra la bonne valeur, par exemple Bénin/Togo en UTC+1 ou Côte d'Ivoire/Sénégal en UTC+0.
2. **Date limite par défaut** : le 10 du mois suivant, modifiable.
3. **Saisie d'une dépense par un admin** : je propose une case « Valider immédiatement », cochée par défaut pour les admins.
4. **Autres captures d'écran** : je les intégrerai dès que vous les enverrez. D'ici là, j'applique le style de cette capture à toutes les pages.
