# CJEP - Application de Gestion Financière et de Suivi

Ce document sert de point de référence central pour comprendre l'architecture, les fonctionnalités et les choix techniques du projet CJEP. Il est particulièrement destiné à guider les développeurs et les assistants IA lors des futures itérations.

## 1. Ce que l'application fait

L'application CJEP (Comité des Jeunes pour l'Éducation et la Paix / ou entité similaire) est un **tableau de bord de gestion financière et administrative**. Elle permet à une organisation de suivre ses donateurs (Contributeurs), ses bénéficiaires (Étudiants), d'enregistrer et valider ses flux financiers (Entrées et Dépenses), de visualiser une matrice des cotisations mensuelles, de générer des rapports et de gérer les paramètres de l'organisation.

## 2. Fonctionnalités implémentées

- **Tableau de bord (Dashboard) :** 
  - Indicateurs de performance (KPIs) dynamiques : Solde, Entrées, Dépenses.
  - Graphiques interactifs (BarChart pour Entrées/Dépenses avec vue Semaine/Mois/Année, PieChart pour la répartition).
  - Aperçu rapide des dépenses à valider et des contributeurs en retard.
- **Gestion des Contributeurs :** 
  - Liste filtrable.
  - Ajout de nouveaux contributeurs avec gestion du rôle (Membre, Observateur, etc.).
- **Gestion des Étudiants (Bénéficiaires) :** 
  - Liste détaillée avec filtres et statuts de bourse.
- **Gestion des Flux Financiers (Entrées & Dépenses) :** 
  - **Entrées :** Enregistrement des flux, liaison possible avec un Contributeur existant, annulation/suppression.
  - **Dépenses :** Enregistrement des flux, catégories prédéfinies (Scolarité, Loyer, Restauration, Santé) avec option "Divers" textuelle, système d'approbation (Validation/Rejet) par les administrateurs.
- **Matrice des Cotisations :**
  - Tableau de suivi mensuel croisant les contributeurs et les mois.
  - Défilement horizontal optimisé pour mobile avec colonnes figées.
- **Rapports et Exports :**
  - Interface préparée pour la génération de PDF (Rapport Mensuel, Relevé par Contributeur, Bilan Étudiant).
- **Paramètres et Sécurité :**
  - Formulaire de gestion du profil de l'organisation.
  - Gestion des membres de l'équipe (Utilisateurs).
  - Gestion des mots de passe avec obligation de changement à la première connexion (`mustChangePassword`).

## 3. Structure des fichiers principale

```text
src/
├── app/
│   ├── actions.ts                  # Server Actions (toutes les mutations : ajouter/supprimer/valider)
│   ├── (app)/                      # Routes principales (App Router)
│   │   ├── tableau-de-bord/
│   │   ├── contributeurs/
│   │   ├── etudiants/
│   │   ├── entrees/
│   │   ├── depenses/
│   │   ├── cotisations/
│   │   ├── rapports/
│   │   └── parametres/
├── components/
│   └── ui/                         # Composants d'interface (Modals, formulaires clients, graphiques)
│       ├── AppShell.tsx            # Conteneur principal et logique de tiroir mobile
│       ├── Sidebar.tsx             # Menu de navigation
│       ├── DashboardCharts.tsx     # Graphiques interactifs (Client Component)
│       ├── ParametresForm.tsx      # Formulaire de paramètres isolé (Client Component)
│       └── ...
├── lib/
│   ├── data/
│   │   └── memory.ts               # Base de données simulée en mémoire (Mock DB)
│   └── domain/
│       ├── models.ts               # Interfaces et types TypeScript (User, Contributor, Income, etc.)
│       └── finance.ts              # Logique métier et calculs (getDashboardStats, etc.)
```

## 4. Technologies utilisées

- **Framework :** Next.js 14+ (App Router)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS
- **Icônes :** Lucide React
- **Graphiques :** Recharts
- **Stockage (Prototype) :** Mémoire locale partagée côté serveur via `globalThis`.

## 5. Décisions de Design et d'Architecture

- **Base de données Mockée (`globalThis.mockDb`) :** Afin de prototyper rapidement sans dépendance externe, les données sont stockées dans la mémoire vive du serveur Node.js. L'utilisation de `globalThis` évite que les données ne soient réinitialisées à chaque Hot-Reload (HMR) en développement.
- **Server Actions pour les mutations :** Toutes les opérations d'écriture (création de dépense, modification d'utilisateur) passent par des Server Actions (définies dans `actions.ts`). Les formulaires appellent ces actions directement depuis le JSX (`action={async () => ...}`).
- **Composants Clients Isolés :** Les pages principales (`page.tsx`) sont des Server Components pour bénéficier de la lecture directe dans la "base de données". Les éléments interactifs (boutons avec état, formulaires imbriqués complexes, graphiques avec sélection temporelle) sont extraits dans des fichiers `Client Components` spécifiques (ex: `DashboardCharts.tsx`, `ParametresForm.tsx`) avec la directive `"use client"`.
- **Approche Mobile-First :** L'interface a été corrigée pour être parfaitement utilisable sur mobile. 
  - Les tableaux de données utilisent `whitespace-nowrap` sur leurs cellules (`<td>`) pour forcer un défilement horizontal natif fluide plutôt qu'un écrasement illisible des colonnes.
  - La Matrice des cotisations utilise un ciblage responsive (`min-w-[140px] md:min-w-[200px]`) pour les colonnes collantes (sticky) afin d'éviter d'occuper tout l'écran sur mobile.

## 6. Instructions pour un futur modèle IA

Si vous êtes une intelligence artificielle reprenant ce projet, **Lisez attentivement ces règles :**

1. **Ne cassez pas l'architecture Server/Client :** Ne transformez pas une Page entière en `"use client"` simplement parce qu'il vous manque un gestionnaire d'événement (`onClick`). Extrayez plutôt le bouton ou le widget dans un petit composant client.
2. **Gestion de l'État :** Comprenez que `memory.ts` est la source de vérité. Les composants Server lisent `db`, et les Server Actions (`actions.ts`) modifient `db`. Si vous devez forcer un rafraîchissement d'un composant serveur après une action asynchrone côté client, utilisez `useRouter().refresh()` ou `revalidatePath()`.
3. **Design System & Tailwind :** Maintenez la cohérence visuelle. Utilisez les variables sémantiques (ex: `bg-card`, `border-border`, `text-primary`). Les éléments interactifs doivent toujours avoir des états de survol (`hover:bg-gray-50`, `transition-colors`).
4. **Tableaux Responsives :** Tout nouveau tableau inséré dans une page doit être enveloppé d'une `div` avec `overflow-x-auto`. Les balises `<td>` doivent inclure `whitespace-nowrap` pour empêcher la rupture de ligne sur mobile.
5. **Règles Next.js (AGENTS.md) :** Respectez impérativement toutes les règles Next.js injectées au démarrage ou définies dans `AGENTS.md`. Ne modifiez pas la structure de base sans une excellente raison technique validée par l'utilisateur.
