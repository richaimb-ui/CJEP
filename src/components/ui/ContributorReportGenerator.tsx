"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
  Filter,
  Users,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Table as TableIcon,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  CONTRIBUTOR_ATTRIBUTES,
  ContributorAttributeKey,
  FormattedContributorData,
  ReportConfigOptions,
  formatContributorRecord,
  getAttributeValue,
  exportContributorsCsv,
} from "@/lib/domain/contributor-report";
import { generateCustomContributorPdf } from "@/lib/pdf";
import { formatCFA } from "@/lib/utils";

export function ContributorReportGenerator() {
  const supabase = createClient();

  // Données brutes
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [orgName, setOrgName] = useState("COMITÉ JOSEPH pour les Etudes Pastorales");
  const [rawContributors, setRawContributors] = useState<any[]>([]);
  const [rawPledges, setRawPledges] = useState<any[]>([]);
  const [rawIncomes, setRawIncomes] = useState<any[]>([]);

  // Configuration du rapport
  const [reportTitle, setReportTitle] = useState("Rapport Récapitulatif des Contributeurs");
  const [mode, setMode] = useState<"table" | "cards">("table");
  const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const [selectedAttributes, setSelectedAttributes] = useState<ContributorAttributeKey[]>([
    "name",
    "phone",
    "monthlyAmount",
    "totalContributed",
    "cotisationStatus",
    "lastPayment",
  ]);

  // Filtres
  const [filterScope, setFilterScope] = useState<"ALL" | "ACTIVE" | "LATE" | "UP_TO_DATE" | "CUSTOM">("ALL");
  const [selectedContributorIds, setSelectedContributorIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Charger les données
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [orgRes, contribsRes, pledgesRes, incomesRes] = await Promise.all([
          supabase.from("organization").select("name").limit(1).maybeSingle(),
          supabase.from("contributors").select("*"),
          supabase.from("pledges").select("*"),
          supabase.from("incomes").select("*"),
        ]);

        if (orgRes.data?.name) {
          setOrgName(orgRes.data.name);
        }
        if (contribsRes.data) {
          setRawContributors(contribsRes.data);
          setSelectedContributorIds(contribsRes.data.map((c) => c.id));
        }
        if (pledgesRes.data) setRawPledges(pledgesRes.data);
        if (incomesRes.data) setRawIncomes(incomesRes.data);
      } catch (err: any) {
        console.error("Erreur de chargement des données:", err);
        toast.error("Impossible de charger les contributeurs.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Formatage de tous les contributeurs
  const allFormattedContributors: FormattedContributorData[] = useMemo(() => {
    return rawContributors.map((c) =>
      formatContributorRecord(c, rawPledges, rawIncomes)
    );
  }, [rawContributors, rawPledges, rawIncomes]);

  // Filtrage selon les choix de l'utilisateur
  const filteredContributors: FormattedContributorData[] = useMemo(() => {
    return allFormattedContributors.filter((c) => {
      // Filtre de recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }

      // Filtre de périmètre
      if (filterScope === "ACTIVE") {
        return c.status.toLowerCase() === "actif";
      }
      if (filterScope === "LATE") {
        return c.cotisationStatusRaw === "late";
      }
      if (filterScope === "UP_TO_DATE") {
        return c.cotisationStatusRaw === "up_to_date";
      }
      if (filterScope === "CUSTOM") {
        return selectedContributorIds.includes(c.id);
      }

      return true;
    });
  }, [allFormattedContributors, filterScope, selectedContributorIds, searchQuery]);

  // Indicateurs globaux pour la sélection filtrée
  const stats = useMemo(() => {
    const total = filteredContributors.length;
    const totalVersé = filteredContributors.reduce((s, c) => s + c.totalContributedRaw, 0);
    const totalEngagements = filteredContributors.reduce((s, c) => s + c.pledgeAmount, 0);
    const aJour = filteredContributors.filter((c) => c.cotisationStatusRaw === "up_to_date").length;
    const enRetard = filteredContributors.filter((c) => c.cotisationStatusRaw === "late").length;
    return { total, totalVersé, totalEngagements, aJour, enRetard };
  }, [filteredContributors]);

  // Basculer un attribut
  const toggleAttribute = (key: ContributorAttributeKey) => {
    if (selectedAttributes.includes(key)) {
      if (selectedAttributes.length === 1) {
        toast.warning("Vous devez conserver au moins un attribut sélectionné.");
        return;
      }
      setSelectedAttributes(selectedAttributes.filter((k) => k !== key));
    } else {
      setSelectedAttributes([...selectedAttributes, key]);
    }
  };

  // Presets d'attributs
  const applyPreset = (preset: "all" | "recommended" | "directory" | "financial" | "none") => {
    switch (preset) {
      case "all":
        setSelectedAttributes(CONTRIBUTOR_ATTRIBUTES.map((a) => a.key));
        break;
      case "recommended":
        setSelectedAttributes([
          "name",
          "phone",
          "monthlyAmount",
          "totalContributed",
          "cotisationStatus",
          "lastPayment",
        ]);
        break;
      case "directory":
        setSelectedAttributes(["name", "phone", "email", "role", "status", "joinedAt"]);
        break;
      case "financial":
        setSelectedAttributes([
          "name",
          "monthlyAmount",
          "totalContributed",
          "cotisationStatus",
          "paymentsCount",
          "lastPayment",
          "paymentHistory",
        ]);
        break;
      case "none":
        setSelectedAttributes(["name"]);
        break;
    }
  };

  // Gestion de la sélection individuelle des contributeurs
  const toggleContributorSelect = (id: string) => {
    if (selectedContributorIds.includes(id)) {
      setSelectedContributorIds(selectedContributorIds.filter((item) => item !== id));
    } else {
      setSelectedContributorIds([...selectedContributorIds, id]);
    }
  };

  const selectAllContributors = () => {
    setSelectedContributorIds(allFormattedContributors.map((c) => c.id));
  };

  const deselectAllContributors = () => {
    setSelectedContributorIds([]);
  };

  // Génération du PDF
  const handleGeneratePdf = async () => {
    if (filteredContributors.length === 0) {
      toast.error("Aucun contributeur ne correspond aux filtres choisis.");
      return;
    }

    setGeneratingPdf(true);
    const toastId = toast.loading("Génération du rapport PDF en cours...");

    try {
      const config: ReportConfigOptions = {
        title: reportTitle,
        mode,
        orientation,
        selectedAttributes,
        selectedContributorIds,
        filterStatus: "ALL",
        filterPayment: "ALL",
      };

      await generateCustomContributorPdf(filteredContributors, config, orgName);
      toast.success("Rapport PDF généré et téléchargé !", { id: toastId });
    } catch (err: any) {
      console.error("Erreur lors de la génération PDF:", err);
      toast.error(err.message || "Erreur lors de la génération du PDF.", { id: toastId });
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredContributors.length === 0) {
      toast.error("Aucun contributeur à exporter.");
      return;
    }

    try {
      const dateStr = new Date().toISOString().split("T")[0];
      exportContributorsCsv(
        filteredContributors,
        selectedAttributes,
        `Rapport_Contributeurs_CJEP_${dateStr}.csv`
      );
      toast.success("Fichier CSV téléchargé avec succès !");
    } catch (err: any) {
      toast.error("Erreur lors de l'export CSV : " + err.message);
    }
  };

  // Impression
  const handlePrint = () => {
    window.print();
  };

  // Liste des colonnes visibles en mode tableau
  const visibleColumns = useMemo(() => {
    return CONTRIBUTOR_ATTRIBUTES.filter(
      (attr) => selectedAttributes.includes(attr.key) && attr.isTableColumn
    );
  }, [selectedAttributes]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium text-gray-500">Chargement des données pour le rapport...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panneau de configuration principal */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Titre et en-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Générateur de Rapport Contributeurs Personnalisé
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Sélectionnez les attributs, ajustez les filtres et exportez un rapport sur-mesure (PDF ou Excel).
              </p>
            </div>
          </div>

          {/* Boutons d'export rapides */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={filteredContributors.length === 0}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              title="Exporter les colonnes sélectionnées au format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2.5 bg-background border border-border rounded-xl text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              title="Imprimer directement"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={handleGeneratePdf}
              disabled={generatingPdf || filteredContributors.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{generatingPdf ? "Génération PDF..." : "Télécharger PDF"}</span>
            </button>
          </div>
        </div>

        {/* Section 1 : Titre et Type de Présentation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Titre du rapport
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Ex: Rapport Récapitulatif des Cotisations 2026"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Format d'affichage
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("table")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  mode === "table"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background border-border text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tableau Global</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("cards")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  mode === "cards"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-background border-border text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Fiches Individuelles</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Orientation de page (PDF)
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="auto">Automatique (Paysage dès 5 colonnes)</option>
              <option value="portrait">Portrait (Vertical)</option>
              <option value="landscape">Paysage (Horizontal - Recommandé)</option>
            </select>
          </div>
        </div>

        {/* Section 2 : Sélection des Attributs */}
        <div className="border border-border/70 rounded-xl p-4 bg-gray-50/40 dark:bg-gray-900/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
            <div>
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Attributs à inclure sur le rapport
              </span>
              <p className="text-xs text-gray-500">
                {selectedAttributes.length} attribut(s) sélectionné(s) sur {CONTRIBUTOR_ATTRIBUTES.length} disponibles
              </p>
            </div>

            {/* Presets rapides */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-gray-400 font-medium mr-1">Raccourcis :</span>
              <button
                type="button"
                onClick={() => applyPreset("recommended")}
                className="px-2.5 py-1 bg-card border border-border rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => applyPreset("financial")}
                className="px-2.5 py-1 bg-card border border-border rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Financier
              </button>
              <button
                type="button"
                onClick={() => applyPreset("directory")}
                className="px-2.5 py-1 bg-card border border-border rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Annuaire
              </button>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="px-2.5 py-1 bg-card border border-border rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Tout cocher
              </button>
              <button
                type="button"
                onClick={() => applyPreset("none")}
                className="px-2.5 py-1 bg-card border border-border rounded-lg text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Grille des cases à cocher par catégorie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {CONTRIBUTOR_ATTRIBUTES.map((attr) => {
              const isChecked = selectedAttributes.includes(attr.key);
              return (
                <label
                  key={attr.key}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isChecked
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-background border-border/70 hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                      isChecked
                        ? "bg-primary border-primary text-white"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAttribute(attr.key)}
                    className="hidden"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${isChecked ? "text-primary" : "text-foreground"}`}>
                      {attr.label}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5" title={attr.description}>
                      {attr.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 3 : Filtres & Périmètre des Contributeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Périmètre */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary" />
              Périmètre des contributeurs
            </label>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value as any)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Tous les contributeurs ({allFormattedContributors.length})</option>
              <option value="ACTIVE">Actifs uniquement</option>
              <option value="UP_TO_DATE">À jour de cotisation uniquement</option>
              <option value="LATE">En retard de cotisation uniquement</option>
              <option value="CUSTOM">Sélection manuelle personnalisée</option>
            </select>
          </div>

          {/* Recherche */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Filtrer par nom ou contact
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Tiroir / Sélecteur manuel si mode CUSTOM */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
              Sélection manuelle détaillée
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors"
              >
                <span className="truncate text-gray-700 dark:text-gray-300">
                  {selectedContributorIds.length} contributeur(s) sélectionné(s)
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-3 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-xs">
                    <button
                      type="button"
                      onClick={selectAllContributors}
                      className="text-primary hover:underline font-semibold"
                    >
                      Tout cocher
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllContributors}
                      className="text-gray-500 hover:underline"
                    >
                      Tout décocher
                    </button>
                  </div>
                  <div className="space-y-1">
                    {allFormattedContributors.map((c) => {
                      const isSel = selectedContributorIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleContributorSelect(c.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="font-medium text-foreground">{c.name}</span>
                          <span className="text-[10px] text-gray-400 ml-auto">{c.monthlyAmount}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bandeau KPI Récapitulatif */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 dark:bg-gray-900/40 p-4 rounded-xl border border-border/70">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Contributeurs</p>
            <p className="text-lg md:text-xl font-extrabold text-foreground mt-0.5">{stats.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Engagements</p>
            <p className="text-lg md:text-xl font-extrabold text-primary mt-0.5">{formatCFA(stats.totalEngagements)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cotisations Versées</p>
            <p className="text-lg md:text-xl font-extrabold text-green-600 mt-0.5">{formatCFA(stats.totalVersé)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Situation</p>
            <p className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">
              <span className="text-green-600">{stats.aJour} à jour</span> •{" "}
              <span className="text-red-600">{stats.enRetard} en retard</span>
            </p>
          </div>
        </div>
      </div>

      {/* Prévisualisation dynamique en direct */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Aperçu en direct du rapport ({filteredContributors.length} ligne(s))
            </h3>
            <p className="text-xs text-gray-500">
              Vérifiez ci-dessous les données et colonnes sélectionnées avant d'exporter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium">
              {visibleColumns.length} colonne(s) affichée(s)
            </span>
          </div>
        </div>

        {/* Rendu du Tableau */}
        {mode === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs text-left">
              <thead className="text-gray-600 dark:text-gray-300 bg-gray-100/70 dark:bg-gray-800/60 font-semibold border-b border-border">
                <tr>
                  {visibleColumns.map((col) => (
                    <th key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredContributors.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {visibleColumns.map((col) => {
                      const val = getAttributeValue(c, col.key);

                      // Mise en forme selon l'attribut
                      if (col.key === "name") {
                        return (
                          <td key={col.key} className="py-3 px-3.5 font-bold text-foreground whitespace-nowrap">
                            {val}
                          </td>
                        );
                      }

                      if (col.key === "cotisationStatus") {
                        const isLate = c.cotisationStatusRaw === "late";
                        const isUpToDate = c.cotisationStatusRaw === "up_to_date";
                        return (
                          <td key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                isUpToDate
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : isLate
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              }`}
                            >
                              {isUpToDate && <CheckCircle2 className="w-3 h-3" />}
                              {isLate && <AlertTriangle className="w-3 h-3" />}
                              {val}
                            </span>
                          </td>
                        );
                      }

                      if (col.key === "monthlyAmount" || col.key === "totalContributed") {
                        return (
                          <td key={col.key} className="py-3 px-3.5 font-semibold text-foreground whitespace-nowrap">
                            {val}
                          </td>
                        );
                      }

                      return (
                        <td key={col.key} className="py-3 px-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {filteredContributors.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length || 1} className="py-12 text-center text-gray-500">
                      Aucun contributeur ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Ligne de totalisation en pied de tableau */}
              {filteredContributors.length > 0 && (
                <tfoot className="bg-gray-100/70 dark:bg-gray-800/60 font-bold border-t border-border">
                  <tr>
                    {visibleColumns.map((col, idx) => {
                      if (idx === 0) {
                        return (
                          <td key={col.key} className="py-3 px-3.5 text-foreground whitespace-nowrap">
                            TOTAL ({filteredContributors.length} contributeurs)
                          </td>
                        );
                      }
                      if (col.key === "monthlyAmount") {
                        return (
                          <td key={col.key} className="py-3 px-3.5 text-primary whitespace-nowrap">
                            {formatCFA(stats.totalEngagements)}
                          </td>
                        );
                      }
                      if (col.key === "totalContributed") {
                        return (
                          <td key={col.key} className="py-3 px-3.5 text-green-600 whitespace-nowrap">
                            {formatCFA(stats.totalVersé)}
                          </td>
                        );
                      }
                      return <td key={col.key} className="py-3 px-3.5" />;
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          /* Rendu Fiches Individuelles */
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredContributors.map((c) => (
              <div
                key={c.id}
                className="border border-border rounded-xl p-4 bg-background/50 hover:bg-background transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{c.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                      {c.role}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.cotisationStatusRaw === "up_to_date"
                        ? "bg-green-100 text-green-700"
                        : c.cotisationStatusRaw === "late"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.cotisationStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  {CONTRIBUTOR_ATTRIBUTES.filter(
                    (attr) => selectedAttributes.includes(attr.key) && attr.key !== "name" && attr.key !== "paymentHistory"
                  ).map((attr) => (
                    <div key={attr.key}>
                      <span className="text-[11px] text-gray-400 font-medium">{attr.label} :</span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {getAttributeValue(c, attr.key)}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedAttributes.includes("paymentHistory") && (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Historique des versements ({c.payments.length}) :
                    </p>
                    {c.payments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left">
                          <thead className="text-gray-400 border-b border-border">
                            <tr>
                              <th className="pb-1">Date</th>
                              <th className="pb-1">Réf</th>
                              <th className="pb-1">Type</th>
                              <th className="pb-1 text-right">Montant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.payments.slice(0, 5).map((p, idx) => (
                              <tr key={idx} className="border-b border-border/30 last:border-0">
                                <td className="py-1">{p.receivedOn}</td>
                                <td className="py-1 text-gray-500">{p.ref}</td>
                                <td className="py-1">{p.type}</td>
                                <td className="py-1 text-right font-medium">{formatCFA(p.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {c.payments.length > 5 && (
                          <p className="text-[10px] text-gray-400 italic mt-1">
                            + {c.payments.length - 5} autre(s) versement(s) inclus dans le PDF complet.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Aucun versement enregistré.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
