import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCFA } from '@/lib/utils';
import { supabase } from '@/lib/data/supabase';

export async function generateMonthlyReport(monthString: string) {
  // 1. Fetch organization config
  const { data: org } = await supabase.from('organization').select('*').limit(1).maybeSingle();
  const orgName = org?.name || "COMITÉ JOSEPH pour les Etudes Pastorales";

  // 2. Compute date range (e.g. "Octobre 2026")
  const parts = monthString.split(" ");
  const monthsFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const mIndex = monthsFr.indexOf(parts[0]);
  const year = parseInt(parts[1]);
  
  const startStr = `${year}-${String(mIndex + 1).padStart(2, '0')}-01`;
  const endStr = `${year}-${String(mIndex + 1).padStart(2, '0')}-31`; // Approx, enough for string comparison

  // 3. Fetch Incomes & Expenses
  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .gte('receivedOn', startStr)
    .lte('receivedOn', endStr);

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('spentOn', startStr)
    .lte('spentOn', endStr);

  const totalIncomes = (incomes || []).reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);

  // 4. Create PDF
  const doc = new jsPDF();
  
  // Load and add logo
  const img = new window.Image();
  img.src = '/Logo%20C.jpg';
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve; // Ignore error to not crash if logo is missing
  });
  
  if (img.complete && img.naturalWidth > 0) {
    // Add logo to top right (x: 170, y: 15, w: 25, h: 25)
    doc.addImage(img, 'JPEG', 170, 10, 25, 25);
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
  
  const incomeRows = (incomes || []).map(inc => [
    inc.receivedOn,
    inc.ref,
    inc.sourceName,
    inc.type,
    formatCFA(inc.amount)
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['Date', 'Réf', 'Source', 'Type', 'Montant']],
    body: incomeRows.length > 0 ? incomeRows : [['-', '-', 'Aucune entrée', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [27, 31, 59] },
  });

  // Expenses Table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 80;
  
  doc.text("Détail des Dépenses", 14, finalY + 15);
  
  const expenseRows = (expenses || []).map(exp => [
    exp.spentOn,
    exp.ref,
    exp.category,
    formatCFA(exp.amount)
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Date', 'Réf', 'Catégorie', 'Montant']],
    body: expenseRows.length > 0 ? expenseRows : [['-', '-', 'Aucune dépense', '-']],
    theme: 'striped',
    headStyles: { fillColor: [27, 31, 59] },
  });

  doc.save(`Rapport_${parts[0]}_${year}.pdf`);
}

export async function generateContributorReport(contributorIds: string[]) {
  const { data: org } = await supabase.from('organization').select('*').limit(1).maybeSingle();
  const orgName = org?.name || "COMITÉ JOSEPH pour les Etudes Pastorales";

  const { data: contributors } = await supabase
    .from('contributors')
    .select('*')
    .in('id', contributorIds);
    
  if (!contributors || contributors.length === 0) {
    alert("Aucun contributeur trouvé.");
    return;
  }

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .in('contributorId', contributorIds);

  const doc = new jsPDF();
  
  // Load and add logo
  const img = new window.Image();
  img.src = '/Logo%20C.jpg';
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
  
  if (img.complete && img.naturalWidth > 0) {
    doc.addImage(img, 'JPEG', 170, 10, 25, 25);
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
    
    const contribIncomes = (incomes || []).filter(inc => inc.contributorId === contributor.id);
    const totalContrib = contribIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total versé : ${formatCFA(totalContrib)}`, 14, currentY + 7);

    const incomeRows = contribIncomes.map(inc => [
      inc.receivedOn,
      inc.ref,
      inc.type,
      formatCFA(inc.amount)
    ]);

    autoTable(doc, {
      startY: currentY + 12,
      head: [['Date', 'Réf', 'Type', 'Montant']],
      body: incomeRows.length > 0 ? incomeRows : [['-', '-', 'Aucun paiement', '-']],
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113] },
      margin: { bottom: 20 }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable?.finalY + 20;
    
    // Add page if needed
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
  }

  doc.save(`Releve_Contributeurs.pdf`);
}
