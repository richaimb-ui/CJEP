/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCFA } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import {
  CONTRIBUTOR_ATTRIBUTES,
  FormattedContributorData,
  ReportConfigOptions,
  getAttributeValue,
} from "@/lib/domain/contributor-report";

export async function generateMonthlyReport(monthString: string) {
  const supabase = createClient();
  // 1. Fetch organization config
  const { data: org } = await supabase.from("organization").select("*").limit(1).maybeSingle();
  const orgName = org?.name || "COMITÉ JOSEPH pour les Etudes Pastorales";

  // 2. Compute date range (e.g. "Octobre 2026")
  const parts = monthString.split(" ");
  const monthsFr = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const mIndex = monthsFr.indexOf(parts[0]);
  const year = parseInt(parts[1]);

  const startStr = `${year}-${String(mIndex + 1).padStart(2, "0")}-01`;
  const endStr = `${year}-${String(mIndex + 1).padStart(2, "0")}-31`; // Approx, enough for string comparison

  // 3. Fetch Incomes & Expenses
  const { data: incomes } = await supabase
    .from("incomes")
    .select("*")
    .gte("receivedOn", startStr)
    .lte("receivedOn", endStr);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .gte("spentOn", startStr)
    .lte("spentOn", endStr);

  const totalIncomes = (incomes || []).reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);

  // 4. Create PDF
  const doc = new jsPDF();

  // Load and add logo
  const img = new window.Image();
  img.src = "/Logo%20C.jpg";
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve; // Ignore error to not crash if logo is missing
  });

  if (img.complete && img.naturalWidth > 0) {
    // Add logo to top right (x: 170, y: 15, w: 25, h: 25)
    doc.addImage(img, "JPEG", 170, 10, 25, 25);
  }

  // Header
  doc.setFontSize(18);
  doc.setTextColor(27, 31, 59); // Primary color
  doc.text(orgName, 14, 22);

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Rapport Mensuel - ${monthString}`, 14, 30);

  // Summary box
  doc.setFontSize(12);
  doc.text(`Total des Entrées : ${formatCFA(totalIncomes)}`, 14, 45);
  doc.text(`Total des Dépenses : ${formatCFA(totalExpenses)}`, 14, 52);
  doc.text(`Bilan du Mois : ${formatCFA(totalIncomes - totalExpenses)}`, 14, 59);

  // Incomes Table
  doc.setFontSize(14);
  doc.setTextColor(27, 31, 59);
  doc.text("Détail des Entrées", 14, 75);

  const incomeRows = (incomes || []).map((inc) => [
    inc.receivedOn,
    inc.ref,
    inc.sourceName,
    inc.type,
    formatCFA(inc.amount),
  ]);

  autoTable(doc, {
    startY: 80,
    head: [["Date", "Réf", "Source", "Type", "Montant"]],
    body: incomeRows.length > 0 ? incomeRows : [["-", "-", "Aucune entrée", "-", "-"]],
    theme: "striped",
    headStyles: { fillColor: [27, 31, 59] },
  });

  // Expenses Table
  const finalY = (doc as any).lastAutoTable?.finalY || 80;

  doc.text("Détail des Dépenses", 14, finalY + 15);

  const expenseRows = (expenses || []).map((exp) => [
    exp.spentOn,
    exp.ref,
    exp.category,
    formatCFA(exp.amount),
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Date", "Réf", "Catégorie", "Montant"]],
    body: expenseRows.length > 0 ? expenseRows : [["-", "-", "Aucune dépense", "-"]],
    theme: "striped",
    headStyles: { fillColor: [27, 31, 59] },
  });

  doc.save(`Rapport_${parts[0]}_${year}.pdf`);
}

export async function generateContributorReport(contributorIds: string[]) {
  const supabase = createClient();
  const { data: org } = await supabase.from("organization").select("*").limit(1).maybeSingle();
  const orgName = org?.name || "COMITÉ JOSEPH pour les Etudes Pastorales";

  const { data: contributors } = await supabase
    .from("contributors")
    .select("*")
    .in("id", contributorIds);

  if (!contributors || contributors.length === 0) {
    alert("Aucun contributeur trouvé.");
    return;
  }

  const { data: incomes } = await supabase
    .from("incomes")
    .select("*")
    .in("contributorId", contributorIds);

  const doc = new jsPDF();

  // Load and add logo
  const img = new window.Image();
  img.src = "/Logo%20C.jpg";
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });

  if (img.complete && img.naturalWidth > 0) {
    doc.addImage(img, "JPEG", 170, 10, 25, 25);
  }

  doc.setFontSize(18);
  doc.setTextColor(27, 31, 59);
  doc.text(orgName, 14, 22);

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Relevé de Cotisations", 14, 30);

  let currentY = 45;

  for (const contributor of contributors) {
    doc.setFontSize(16);
    doc.setTextColor(27, 31, 59);
    doc.text(`Contributeur : ${contributor.firstName} ${contributor.lastName}`, 14, currentY);

    const contribIncomes = (incomes || []).filter((inc) => inc.contributorId === contributor.id);
    const totalContrib = contribIncomes.reduce((acc, curr) => acc + curr.amount, 0);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total versé : ${formatCFA(totalContrib)}`, 14, currentY + 7);

    const incomeRows = contribIncomes.map((inc) => [
      inc.receivedOn,
      inc.ref,
      inc.type,
      formatCFA(inc.amount),
    ]);

    autoTable(doc, {
      startY: currentY + 12,
      head: [["Date", "Réf", "Type", "Montant"]],
      body: incomeRows.length > 0 ? incomeRows : [["-", "-", "Aucun paiement", "-"]],
      theme: "grid",
      headStyles: { fillColor: [46, 204, 113] },
      margin: { bottom: 20 },
    });

    currentY = (doc as any).lastAutoTable?.finalY + 20;

    // Add page if needed
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
  }

  doc.save(`Releve_Contributeurs.pdf`);
}

/**
 * Générateur de rapport PDF personnalisé avec sélection d'attributs
 */
export async function generateCustomContributorPdf(
  contributors: FormattedContributorData[],
  config: ReportConfigOptions,
  orgNameParam?: string
) {
  if (contributors.length === 0) {
    alert("Aucun contributeur à inclure dans le rapport.");
    return;
  }

  const supabase = createClient();
  const { data: org } = await supabase.from("organization").select("*").limit(1).maybeSingle();
  const orgName = orgNameParam || org?.name || "COMITÉ JOSEPH pour les Etudes Pastorales";

  // Déterminer les attributs visibles en tableau
  const visibleAttrs = CONTRIBUTOR_ATTRIBUTES.filter(
    (attr) => config.selectedAttributes.includes(attr.key) && attr.isTableColumn
  );

  if (visibleAttrs.length === 0 && config.mode === "table") {
    alert("Veuillez sélectionner au moins un attribut affichable en tableau.");
    return;
  }

  // Déterminer l'orientation
  let isLandscape = false;
  if (config.orientation === "landscape") {
    isLandscape = true;
  } else if (config.orientation === "portrait") {
    isLandscape = false;
  } else {
    // Mode auto: si 5 colonnes ou plus, ou si tableau avec beaucoup d'infos, privilégier le paysage
    isLandscape = visibleAttrs.length >= 5;
  }

  const orientation = isLandscape ? "landscape" : "portrait";
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;

  // Charger le logo
  const img = new window.Image();
  img.src = "/Logo%20C.jpg";
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });

  // Fonction pour dessiner l'en-tête commun
  const drawPageHeader = (pageDoc: jsPDF) => {
    if (img.complete && img.naturalWidth > 0) {
      const logoX = pageWidth - 36;
      pageDoc.addImage(img, "JPEG", logoX, 10, 22, 22);
    }

    // Nom de l'organisation
    pageDoc.setFontSize(15);
    pageDoc.setFont("helvetica", "bold");
    pageDoc.setTextColor(27, 31, 59);
    pageDoc.text(orgName, 14, 18);

    // Titre du rapport
    pageDoc.setFontSize(12);
    pageDoc.setFont("helvetica", "bold");
    pageDoc.setTextColor(60, 60, 60);
    const reportTitle = config.title || "Rapport Récapitulatif des Contributeurs";
    pageDoc.text(reportTitle, 14, 25);

    // Métadonnées
    pageDoc.setFontSize(9);
    pageDoc.setFont("helvetica", "normal");
    pageDoc.setTextColor(120, 120, 120);
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    pageDoc.text(`Document généré le ${dateStr} • Effectif : ${contributors.length} contributeur(s)`, 14, 31);

    // Ligne séparatrice
    pageDoc.setDrawColor(230, 230, 230);
    pageDoc.setLineWidth(0.5);
    pageDoc.line(14, 34, pageWidth - 14, 34);
  };

  // Calculs synthétiques pour le bandeau KPI
  const totalCotisations = contributors.reduce((sum, c) => sum + c.totalContributedRaw, 0);
  const totalEngagements = contributors.reduce((sum, c) => sum + c.pledgeAmount, 0);
  const upToDateCount = contributors.filter((c) => c.cotisationStatusRaw === "up_to_date").length;
  const lateCount = contributors.filter((c) => c.cotisationStatusRaw === "late").length;

  if (config.mode === "table") {
    // Mode Tableau Synthétique
    drawPageHeader(doc);

    // Dessin du bandeau KPI
    const kpiY = 38;
    const kpiHeight = 16;
    const kpiWidth = pageWidth - 28;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, kpiY, kpiWidth, kpiHeight, 2, 2, "FD");

    const colWidth = kpiWidth / 4;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    // KPI 1
    doc.text("CONTRIBUTEURS", 18, kpiY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(27, 31, 59);
    doc.text(`${contributors.length}`, 18, kpiY + 11);

    // KPI 2
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL ENGAGEMENTS", 18 + colWidth, kpiY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(27, 31, 59);
    doc.text(formatCFA(totalEngagements), 18 + colWidth, kpiY + 11);

    // KPI 3
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL VERSÉ CUMULÉ", 18 + colWidth * 2, kpiY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52); // Vert foncé
    doc.text(formatCFA(totalCotisations), 18 + colWidth * 2, kpiY + 11);

    // KPI 4
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("ÉTAT DES COTISATIONS", 18 + colWidth * 3, kpiY + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(27, 31, 59);
    doc.text(`${upToDateCount} à jour / ${lateCount} en retard`, 18 + colWidth * 3, kpiY + 11);

    // Construction du tableau
    const headers = visibleAttrs.map((attr) => attr.label);
    const rows = contributors.map((c) => visibleAttrs.map((attr) => getAttributeValue(c, attr.key)));

    // Ligne de totaux
    const footerRow = visibleAttrs.map((attr, index) => {
      if (index === 0) return "TOTAL";
      if (attr.key === "monthlyAmount") return formatCFA(totalEngagements);
      if (attr.key === "totalContributed") return formatCFA(totalCotisations);
      return "";
    });

    // Configuration des styles de colonnes
    const columnStyles: { [key: number]: any } = {};
    visibleAttrs.forEach((attr, idx) => {
      if (attr.key === "monthlyAmount" || attr.key === "totalContributed") {
        columnStyles[idx] = { halign: "right", fontStyle: "bold" };
      } else if (attr.key === "cotisationStatus" || attr.key === "status") {
        columnStyles[idx] = { halign: "center" };
      }
    });

    autoTable(doc, {
      startY: 59,
      head: [headers],
      body: rows,
      foot: [footerRow],
      theme: "striped",
      styles: {
        fontSize: isLandscape ? 8.5 : 8,
        cellPadding: 2.5,
        textColor: [40, 40, 40],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [27, 31, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [27, 31, 59],
        fontStyle: "bold",
      },
      columnStyles,
      margin: { left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        // En-tête pour les pages suivantes
        if (data.pageNumber > 1) {
          drawPageHeader(doc);
        }
      },
    });
  } else {
    // Mode Fiches Détaillées
    let currentY = 14;

    for (let i = 0; i < contributors.length; i++) {
      const c = contributors[i];

      // Nouvelle page pour chaque fiche (sauf la première)
      if (i > 0) {
        doc.addPage();
        currentY = 14;
      }

      drawPageHeader(doc);
      currentY = 42;

      // Titre de la fiche contributeur
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, currentY, pageWidth - 28, 16, 2, 2, "FD");

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 31, 59);
      doc.text(c.name, 20, currentY + 10);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Rôle : ${c.role}  |  Statut : ${c.status}  |  Cotisation : ${c.cotisationStatus}`,
        110,
        currentY + 10
      );

      currentY += 22;

      // Grille des attributs sélectionnés
      const attributesToShow = CONTRIBUTOR_ATTRIBUTES.filter(
        (a) => config.selectedAttributes.includes(a.key) && a.key !== "paymentHistory" && a.key !== "name"
      );

      const attrRows: Array<[string, string, string, string]> = [];
      for (let j = 0; j < attributesToShow.length; j += 2) {
        const a1 = attributesToShow[j];
        const a2 = attributesToShow[j + 1];
        attrRows.push([
          a1 ? a1.label : "",
          a1 ? getAttributeValue(c, a1.key) : "",
          a2 ? a2.label : "",
          a2 ? getAttributeValue(c, a2.key) : "",
        ]);
      }

      if (attrRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Information", "Valeur", "Information", "Valeur"]],
          body: attrRows,
          theme: "grid",
          styles: { fontSize: 8.5, cellPadding: 2.5 },
          headStyles: { fillColor: [27, 31, 59], textColor: [255, 255, 255] },
          columnStyles: {
            0: { fontStyle: "bold", textColor: [71, 85, 105], cellWidth: 45 },
            1: { cellWidth: 45 },
            2: { fontStyle: "bold", textColor: [71, 85, 105], cellWidth: 45 },
            3: { cellWidth: 45 },
          },
          margin: { left: 14, right: 14 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Si l'historique des versements est sélectionné
      if (config.selectedAttributes.includes("paymentHistory")) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(27, 31, 59);
        doc.text("Historique des versements", 14, currentY);

        const paymentRows = c.payments.map((p) => [
          p.receivedOn,
          p.ref,
          p.type,
          formatCFA(p.amount),
        ]);

        autoTable(doc, {
          startY: currentY + 4,
          head: [["Date", "Réf", "Type de versement", "Montant"]],
          body: paymentRows.length > 0 ? paymentRows : [["-", "-", "Aucun versement enregistré", "-"]],
          foot: [["", "", "TOTAL VERSÉ", c.totalContributed]],
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [46, 204, 113], textColor: [255, 255, 255] },
          footStyles: { fillColor: [241, 245, 249], fontStyle: "bold" },
          columnStyles: {
            3: { halign: "right", fontStyle: "bold" },
          },
          margin: { left: 14, right: 14, bottom: 20 },
        });
      }
    }
  }

  // Numérotation des pages sur l'ensemble du document
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Bas gauche
    doc.text("CJEP • Application de Gestion Financière • Document Officiel", 14, pageHeight - 10);

    // Bas droite
    const pageText = `Page ${i} sur ${totalPages}`;
    doc.text(pageText, pageWidth - 14 - doc.getTextWidth(pageText), pageHeight - 10);
  }

  const cleanDate = new Date().toISOString().split("T")[0];
  const safeFilename = `Rapport_Contributeurs_CJEP_${cleanDate}.pdf`;
  doc.save(safeFilename);
}
