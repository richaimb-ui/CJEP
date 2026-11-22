import { formatCFA } from "@/lib/utils";

export type ContributorAttributeKey =
  | "name"
  | "phone"
  | "email"
  | "role"
  | "status"
  | "joinedAt"
  | "monthlyAmount"
  | "totalContributed"
  | "paymentsCount"
  | "lastPayment"
  | "cotisationStatus"
  | "paymentHistory";

export type AttributeCategory = "identity" | "contact" | "membership" | "financial";

export interface ContributorAttributeDefinition {
  key: ContributorAttributeKey;
  label: string;
  category: AttributeCategory;
  description: string;
  defaultSelected: boolean;
  isTableColumn: boolean;
}

export const CONTRIBUTOR_ATTRIBUTES: ContributorAttributeDefinition[] = [
  {
    key: "name",
    label: "Nom & Prénom",
    category: "identity",
    description: "Nom complet du contributeur",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "phone",
    label: "Téléphone",
    category: "contact",
    description: "Numéro de téléphone de contact",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "email",
    label: "Email",
    category: "contact",
    description: "Adresse de messagerie",
    defaultSelected: false,
    isTableColumn: true,
  },
  {
    key: "role",
    label: "Rôle",
    category: "membership",
    description: "Rôle dans l'organisation (Membre, Donateur...)",
    defaultSelected: false,
    isTableColumn: true,
  },
  {
    key: "status",
    label: "Statut adhérent",
    category: "membership",
    description: "Statut d'activité (Actif / Inactif)",
    defaultSelected: false,
    isTableColumn: true,
  },
  {
    key: "joinedAt",
    label: "Date d'adhésion",
    category: "membership",
    description: "Date d'enregistrement dans le CJEP",
    defaultSelected: false,
    isTableColumn: true,
  },
  {
    key: "monthlyAmount",
    label: "Engagement mensuel",
    category: "financial",
    description: "Montant de la cotisation mensuelle promise",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "totalContributed",
    label: "Total versé",
    category: "financial",
    description: "Cumul de toutes les cotisations perçues",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "cotisationStatus",
    label: "État de cotisation",
    category: "financial",
    description: "Situation par rapport aux échéances (À jour / En retard / Ponctuel)",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "paymentsCount",
    label: "Nb versements",
    category: "financial",
    description: "Nombre de versements effectués",
    defaultSelected: false,
    isTableColumn: true,
  },
  {
    key: "lastPayment",
    label: "Dernier versement",
    category: "financial",
    description: "Date et montant du versement le plus récent",
    defaultSelected: true,
    isTableColumn: true,
  },
  {
    key: "paymentHistory",
    label: "Historique des versements",
    category: "financial",
    description: "Détail ligne par ligne des versements réalisés",
    defaultSelected: false,
    isTableColumn: false,
  },
];

export interface PaymentItem {
  receivedOn: string;
  ref: string;
  type: string;
  amount: number;
}

export interface FormattedContributorData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  pledgeAmount: number;
  monthlyAmount: string;
  totalContributedRaw: number;
  totalContributed: string;
  paymentsCountRaw: number;
  paymentsCount: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  lastPayment: string;
  cotisationStatusRaw: "up_to_date" | "late" | "ponctuel";
  cotisationStatus: string;
  lateMonthsCount: number;
  payments: PaymentItem[];
}

export interface ReportConfigOptions {
  title?: string;
  mode: "table" | "cards";
  orientation: "auto" | "portrait" | "landscape";
  selectedAttributes: ContributorAttributeKey[];
  selectedContributorIds: string[];
  filterStatus: "ALL" | "ACTIVE" | "INACTIVE";
  filterPayment: "ALL" | "UP_TO_DATE" | "LATE" | "PONCTUEL";
  searchQuery?: string;
}

/**
 * Normalise et calcule toutes les données d'un contributeur
 */
export function formatContributorRecord(
  contributor: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
    status?: string | null;
    joinedAt?: string | null;
  },
  allPledges: Array<{ contributorId: string; monthlyAmount: number; startMonth?: string | null }>,
  allIncomes: Array<{
    id?: string;
    contributorId?: string | null;
    amount: number;
    receivedOn: string;
    ref?: string;
    type?: string;
    status?: string;
  }>,
  currentYear = new Date().getFullYear().toString()
): FormattedContributorData {
  const c = contributor;
  const pledge = allPledges.find((p) => p.contributorId === c.id);
  const pledgeAmount = pledge ? Number(pledge.monthlyAmount) : 0;

  const contributorIncomes = allIncomes
    .filter((inc) => inc.contributorId === c.id)
    .sort((a, b) => new Date(b.receivedOn).getTime() - new Date(a.receivedOn).getTime());

  const totalContributedRaw = contributorIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const payments: PaymentItem[] = contributorIncomes.map((inc) => ({
    receivedOn: inc.receivedOn,
    ref: inc.ref || "-",
    type: inc.type || "Cotisation",
    amount: inc.amount || 0,
  }));

  const lastPaymentObj = contributorIncomes[0];
  const lastPaymentDate = lastPaymentObj ? lastPaymentObj.receivedOn : "-";
  const lastPaymentAmount = lastPaymentObj ? lastPaymentObj.amount : 0;
  const lastPaymentStr = lastPaymentObj
    ? `${lastPaymentObj.receivedOn} (${formatCFA(lastPaymentObj.amount)})`
    : "Aucun";

  // Calcul du statut de cotisation
  let cotisationStatusRaw: "up_to_date" | "late" | "ponctuel" = "ponctuel";
  let cotisationStatusStr = "Ponctuel";
  let lateMonthsCount = 0;

  if (pledgeAmount > 0) {
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0 = Janvier
    const targetYear = parseInt(currentYear);

    // Vérifier les mois échus de l'année en cours
    for (let m = 0; m <= currentMonthIndex; m++) {
      const monthPrefix = `${targetYear}-${String(m + 1).padStart(2, "0")}`;
      const isPaid = contributorIncomes.some(
        (inc) => inc.receivedOn && inc.receivedOn.startsWith(monthPrefix)
      );
      if (!isPaid) {
        lateMonthsCount++;
      }
    }

    if (lateMonthsCount > 0) {
      cotisationStatusRaw = "late";
      cotisationStatusStr = `En retard (${lateMonthsCount} mois)`;
    } else {
      cotisationStatusRaw = "up_to_date";
      cotisationStatusStr = "À jour";
    }
  }

  const fullName = `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Sans nom";

  return {
    id: c.id,
    name: fullName,
    firstName: c.firstName || "",
    lastName: c.lastName || "",
    phone: c.phone || "Non renseigné",
    email: c.email || "Non renseigné",
    role: c.role || "Membre",
    status: c.status || "Actif",
    joinedAt: c.joinedAt ? new Date(c.joinedAt).toLocaleDateString("fr-FR") : "-",
    pledgeAmount,
    monthlyAmount: pledgeAmount > 0 ? formatCFA(pledgeAmount) : "Ponctuel",
    totalContributedRaw,
    totalContributed: formatCFA(totalContributedRaw),
    paymentsCountRaw: contributorIncomes.length,
    paymentsCount: `${contributorIncomes.length} versement(s)`,
    lastPaymentDate,
    lastPaymentAmount,
    lastPayment: lastPaymentStr,
    cotisationStatusRaw,
    cotisationStatus: cotisationStatusStr,
    lateMonthsCount,
    payments,
  };
}

/**
 * Récupère la valeur affichable d'un attribut pour un contributeur donné
 */
export function getAttributeValue(
  item: FormattedContributorData,
  attrKey: ContributorAttributeKey
): string {
  switch (attrKey) {
    case "name":
      return item.name;
    case "phone":
      return item.phone;
    case "email":
      return item.email;
    case "role":
      return item.role;
    case "status":
      return item.status;
    case "joinedAt":
      return item.joinedAt;
    case "monthlyAmount":
      return item.monthlyAmount;
    case "totalContributed":
      return item.totalContributed;
    case "paymentsCount":
      return item.paymentsCount;
    case "lastPayment":
      return item.lastPayment;
    case "cotisationStatus":
      return item.cotisationStatus;
    case "paymentHistory":
      return `${item.payments.length} versement(s)`;
    default:
      return "-";
  }
}

/**
 * Génère le fichier CSV correspondant aux attributs sélectionnés
 */
export function exportContributorsCsv(
  contributors: FormattedContributorData[],
  selectedAttributes: ContributorAttributeKey[],
  fileName = "Rapport_Contributeurs_CJEP.csv"
): void {
  const visibleAttrs = CONTRIBUTOR_ATTRIBUTES.filter(
    (attr) => selectedAttributes.includes(attr.key) && attr.isTableColumn
  );

  const headers = visibleAttrs.map((attr) => `"${attr.label.replace(/"/g, '""')}"`);

  const rows = contributors.map((c) => {
    return visibleAttrs
      .map((attr) => {
        const val = getAttributeValue(c, attr.key);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(";");
  });

  // UTF-8 BOM pour compatibilité Excel
  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
