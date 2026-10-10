import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

const screenshotsDir = path.resolve('public', 'guide_screenshots');

function getBase64Image(filename) {
  const filePath = path.join(screenshotsDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
}

function createManual() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Professional Color Palette
  const primary = [79, 70, 229];       // Indigo #4F46E5
  const primaryDark = [49, 46, 129];   // Dark Indigo #312E81
  const primaryLight = [238, 242, 255];// Light Indigo #EEF2FF
  const textDark = [15, 23, 42];       // Slate 900
  const textMuted = [100, 116, 139];   // Slate 500
  const bgCard = [248, 250, 252];      // Slate 50
  const borderLight = [226, 232, 240]; // Slate 200
  const accentGreen = [16, 185, 129];  // Emerald #10B981
  const accentGreenBg = [236, 253, 245];
  const accentAmber = [217, 119, 6];   // Amber #D97706
  const accentAmberBg = [254, 243, 199];

  function drawHeader(pageNum, title) {
    if (pageNum === 1) return;

    // Header background bar
    doc.setFillColor(...bgCard);
    doc.rect(0, 0, pageWidth, 22, 'F');

    // Header border
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(0, 22, pageWidth, 22);

    // Brand tag
    doc.setFillColor(...primary);
    doc.roundedRect(14, 5.5, 20, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('CJEP', 24, 12.5, { align: 'center' });

    // Header title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryDark);
    doc.text(title, 38, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Manuel Débutant Mobile', 38, 16);

    // Online portal link badge
    doc.setFillColor(...primaryLight);
    doc.roundedRect(pageWidth - 62, 6, 48, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...primary);
    doc.text('www.rezocjep.net', pageWidth - 38, 12.5, { align: 'center' });
  }

  function drawFooter(pageNum, totalPages) {
    if (pageNum === 1) return;

    // Footer divider line
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Comite Joseph (CJEP) — Guide d\'utilisation simplifie pour smartphones', 14, pageHeight - 10);

    // Page number pill
    doc.setFillColor(...bgCard);
    doc.roundedRect(pageWidth - 36, pageHeight - 13.5, 22, 6, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryDark);
    doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - 25, pageHeight - 9.5, { align: 'center' });
  }

  function drawSmartphoneFrame(x, y, w, h, base64Img) {
    // Drop shadow simulation
    doc.setFillColor(220, 225, 235);
    doc.roundedRect(x + 1.2, y + 1.5, w, h, 6, 6, 'F');

    // Phone outer bezel (slate dark)
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, y, w, h, 6, 6, 'F');

    // Phone inner border
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 1.2, y + 1.2, w - 2.4, h - 2.4, 5, 5, 'F');

    // Screen image
    doc.addImage(base64Img, 'PNG', x + 1.5, y + 1.5, w - 3, h - 3, undefined, 'FAST');

    // Speaker notch
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x + (w / 2) - 8, y + 2, 16, 2, 1, 1, 'F');
  }

  function drawStepCard(x, y, w, num, title, text, subPoints = []) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const descLines = doc.splitTextToSize(text, w - 18);

    let totalSubLines = 0;
    const splitSubPoints = subPoints.map(pt => {
      const lines = doc.splitTextToSize(pt, w - 24);
      totalSubLines += lines.length;
      return lines;
    });

    const cardHeight = 12 + (descLines.length * 4) + (totalSubLines * 4.2) + (subPoints.length > 0 ? 3 : 0);

    // Card background
    doc.setFillColor(...bgCard);
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, cardHeight, 3, 3, 'FD');

    // Number bubble
    doc.setFillColor(...primary);
    doc.circle(x + 7, y + 7, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(num), x + 7, y + 8.2, { align: 'center' });

    // Step Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(title, x + 14, y + 8.2);

    // Step description
    let curY = y + 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(descLines, x + 14, curY);
    curY += (descLines.length * 4) + 1;

    // Sub points
    if (splitSubPoints.length > 0) {
      splitSubPoints.forEach(lines => {
        doc.setTextColor(...primary);
        doc.text('>', x + 14, curY);
        doc.setTextColor(...textDark);
        doc.text(lines, x + 18, curY);
        curY += (lines.length * 4.2);
      });
    }

    return cardHeight + 3.5;
  }

  function drawAlertBox(x, y, w, type, title, text) {
    const isSuccess = type === 'success';
    const bg = isSuccess ? accentGreenBg : accentAmberBg;
    const accent = isSuccess ? accentGreen : accentAmber;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const textLines = doc.splitTextToSize(text, w - 10);
    const boxHeight = 12 + (textLines.length * 4.2);

    doc.setFillColor(...bg);
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, boxHeight, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...accent);
    doc.text((isSuccess ? '[OK] ' : '[NOTE] ') + title, x + 5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textDark);
    doc.text(textLines, x + 5, y + 11.5);

    return boxHeight + 3.5;
  }

  // ==========================================
  // PAGE 1 : COUVERTURE & SOMMAIRE
  // ==========================================
  // Gradient top header decoration
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Decorative circles
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.circle(pageWidth - 20, 20, 60, 'F');
  doc.circle(20, 80, 40, 'F');
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  // Main badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(18, 18, 55, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primary);
  doc.text('PORTAIL OFFICIEL CJEP', 45.5, 24, { align: 'center' });

  // Main Cover Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('MANUEL D\'UTILISATION', 18, 42);
  doc.text('SIMPLIFIE', 18, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(224, 231, 255);
  doc.text('Guide Pratique Mobile pour Debutant — Suivi Financier & Cotisations', 18, 62);

  // Link Callout Card on Cover
  doc.setFillColor(...bgCard);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.4);
  doc.roundedRect(18, 76, pageWidth - 36, 26, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text('LIEN D\'ACCES DIRECT A L\'APPLICATION MOBILE :', 26, 84);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primary);
  doc.text('https://www.rezocjep.net/login', 26, 94);

  // Sommaire Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...textDark);
  doc.text('Sommaire du Guide Debutant', 18, 120);

  // Sommaire Cards
  const sommaireItems = [
    { num: '1', title: 'Acces & Connexion a l\'Application', desc: 'Comment ouvrir le lien sur mobile et renseigner ses acces en toute securite.' },
    { num: '2', title: 'Decouverte du Tableau de Bord', desc: 'Comprendre son solde en caisse, les alertes de retard et le menu mobile.' },
    { num: '3', title: 'Enregistrer un Nouveau Contributeur', desc: 'Ajouter pas-a-pas un donateur avec son engagement mensuel en FCFA.' },
    { num: '4', title: 'Saisir un Paiement / une Cotisation', desc: 'Enregistrer un encaissement et le ventiler sur un ou plusieurs mois.' },
    { num: '5', title: 'Suivre la Matrice des Cotisations & Astuces', desc: 'Visualiser la grille mensuelle de controle et securiser ses operations.' }
  ];

  let sumY = 128;
  sommaireItems.forEach(item => {
    doc.setFillColor(...bgCard);
    doc.setDrawColor(...borderLight);
    doc.setLineWidth(0.3);
    doc.roundedRect(18, sumY, pageWidth - 36, 19, 3, 3, 'FD');

    doc.setFillColor(...primaryLight);
    doc.roundedRect(23, sumY + 3.5, 12, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primary);
    doc.text(item.num, 29, sumY + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...textDark);
    doc.text(item.title, 40, sumY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(item.desc, 40, sumY + 14);

    sumY += 23;
  });

  // Footer Cover
  doc.setFillColor(...primaryDark);
  doc.rect(0, pageHeight - 24, pageWidth, 24, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('© 2026 Comite Joseph pour l\'Education et la Paix (CJEP) — Reproduction et usage interne', pageWidth / 2, pageHeight - 12, { align: 'center' });

  // Right Column Phone specs
  const phoneX = 124;
  const phoneY = 30;
  const phoneW = 72;
  const phoneH = 156;

  // ==========================================
  // PAGE 2 : MODULE 1 - CONNEXION SUR MOBILE
  // ==========================================
  doc.addPage();
  drawHeader(2, 'MODULE 1 : CONNEXION SUR SMARTPHONE');

  const colX = 14;
  const colW = 100;
  let curY = 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...textDark);
  doc.text('Comment se connecter ?', colX, curY);
  curY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const p1Text = doc.splitTextToSize('L\'application fonctionne directement sur votre smartphone via votre navigateur web (Chrome, Safari, Edge) sans aucun telechargement necessaire.', colW);
  doc.text(p1Text, colX, curY);
  curY += (p1Text.length * 4) + 2;

  curY += drawStepCard(colX, curY, colW, 1, 'Ouvrir le lien de connexion', 'Touchez le lien recu par message ou saisissez directement l\'adresse dans votre navigateur :', [
    'Adresse URL : https://www.rezocjep.net/login',
    'Conseil : Ajoutez la page a votre ecran d\'accueil pour un acces rapide en 1 clic.'
  ]);

  curY += drawStepCard(colX, curY, colW, 2, 'Saisir vos identifiants', 'Dans les deux champs affiches au centre de l\'ecran :', [
    'Adresse Email : Votre email officiel communique au comite.',
    'Mot de passe : Le mot de passe transmis par l\'administrateur (ex: mot de passe temporaire).'
  ]);

  curY += drawStepCard(colX, curY, colW, 3, 'Valider la connexion', 'Appuyez sur le bouton violet « Se connecter ».', [
    'En cas de 1ere connexion : L\'application vous invitera a definir votre mot de passe secret definitif.'
  ]);

  drawAlertBox(colX, curY, colW, 'warning', 'Securite de votre compte', 'Ne partagez jamais votre mot de passe personnel. En cas de perte, contactez l\'administrateur CJEP.');

  drawSmartphoneFrame(phoneX, phoneY, phoneW, phoneH, getBase64Image('step1_login.png'));

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Ecran 1 : Page de connexion mobile (https://www.rezocjep.net/login)', phoneX + (phoneW / 2), phoneY + phoneH + 6, { align: 'center' });

  drawFooter(2, 6);

  // ==========================================
  // PAGE 3 : MODULE 2 - TABLEAU DE BORD MOBILE
  // ==========================================
  doc.addPage();
  drawHeader(3, 'MODULE 2 : LE TABLEAU DE BORD MOBILE');

  curY = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...textDark);
  doc.text('Comprendre l\'ecran d\'accueil', colX, curY);
  curY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const p2Text = doc.splitTextToSize('Des votre connexion reussie, vous arrivez sur le tableau de bord de l\'organisation. Il synthetise l\'etat de la tresorerie en temps reel.', colW);
  doc.text(p2Text, colX, curY);
  curY += (p2Text.length * 4) + 2;

  curY += drawStepCard(colX, curY, colW, 1, 'Le Solde Actuel en Caisse', 'Affiche le montant net disponible dans la tresorerie generale du Comite (Entrees validees - Depenses validees).', [
    'Total Entrees : Somme globale collectee a ce jour.',
    'Bouton « + Ajouter » : Acces direct pour enregistrer une entree.'
  ]);

  curY += drawStepCard(colX, curY, colW, 2, 'Les Alertes « En Retard »', 'Permet de voir instantanement les contributeurs n\'ayant pas encore cotise pour le mois en cours.', [
    'Une pastille rouge/rose indique un retard.',
    'Appuyez sur un contributeur pour voir son historique.'
  ]);

  curY += drawStepCard(colX, curY, colW, 3, 'La Barre de Navigation Inferieure', 'Situee tout en bas de votre ecran, elle vous permet de naviguer a une main entre les modules :', [
    '[Accueil] : Revenir au Tableau de bord principal.',
    '[Contributeurs] : Liste complete des donateurs.',
    '[Entrees] : Encaissements & Versements recus.',
    '[Depenses] : Sorties de fonds & Bourses.',
    '[Plus ...] : Matrice des cotisations, Rapports, Parametres.'
  ]);

  drawSmartphoneFrame(phoneX, phoneY, phoneW, phoneH, getBase64Image('step2_dashboard.png'));

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Ecran 2 : Tableau de bord optimise pour smartphone', phoneX + (phoneW / 2), phoneY + phoneH + 6, { align: 'center' });

  drawFooter(3, 6);

  // ==========================================
  // PAGE 4 : MODULE 3 - ENREGISTRER UN CONTRIBUTEUR
  // ==========================================
  doc.addPage();
  drawHeader(4, 'MODULE 3 : ENREGISTRER UN CONTRIBUTEUR');

  curY = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...textDark);
  doc.text('Ajouter un nouveau membre donateur', colX, curY);
  curY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const p3Text = doc.splitTextToSize('Chaque personne qui s\'engage a soutenir les etudiants ou le comite doit etre creee comme Contributeur avant de pouvoir lui affecter des paiements.', colW);
  doc.text(p3Text, colX, curY);
  curY += (p3Text.length * 4) + 2;

  curY += drawStepCard(colX, curY, colW, 1, 'Ouvrir la page Contributeurs', 'Appuyez sur l\'icone [Contributeurs] dans la barre en bas de votre ecran pour afficher la liste des donateurs existants.', [
    'Vous pouvez rechercher un contributeur par son nom grace a la barre de recherche en haut.'
  ]);

  curY += drawStepCard(colX, curY, colW, 2, 'Ouvrir le formulaire d\'ajout', 'Appuyez sur le bouton sombre « + » (ou « + Nouveau »). Une fenetre s\'ouvre par-dessus l\'ecran.', [
    'Sur mobile, cette fenetre s\'adapte confortablement a votre ecran avec defilement.'
  ]);

  curY += drawStepCard(colX, curY, colW, 3, 'Renseigner les informations', 'Remplissez soigneusement les champs demandes :', [
    'Prenom & Nom : Obligatoires (ex: Jean-Marc KOUADIO).',
    'Email : Optionnel (recommande si disponible).',
    'Telephone : Optionnel (utile pour les rappels WhatsApp).',
    'Engagement mensuel : Montant recurrent en FCFA promis chaque mois (ex: 10 000).'
  ]);

  curY += drawStepCard(colX, curY, colW, 4, 'Enregistrer le contributeur', 'Appuyez sur le bouton « Enregistrer le contributeur » fixe tout en bas de la fenetre.', [
    'Un message vert « Contributeur enregistre avec succes ! » confirme la creation.'
  ]);

  drawAlertBox(colX, curY, colW, 'success', 'Pret pour les paiements', 'Des l\'enregistrement, ce membre est immediatement disponible dans la liste pour recevoir des cotisations !');

  drawSmartphoneFrame(phoneX, phoneY, phoneW, phoneH, getBase64Image('step4_modal_contributeur.png'));

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Ecran 3 : Formulaire d\'enregistrement d\'un contributeur', phoneX + (phoneW / 2), phoneY + phoneH + 6, { align: 'center' });

  drawFooter(4, 6);

  // ==========================================
  // PAGE 5 : MODULE 4 - SAISIR UN PAIEMENT / COTISATION
  // ==========================================
  doc.addPage();
  drawHeader(5, 'MODULE 4 : SAISIR UN PAIEMENT / COTISATION');

  curY = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...textDark);
  doc.text('Enregistrer un encaissement', colX, curY);
  curY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const p4Text = doc.splitTextToSize('Lorsqu\'un membre effectue un versement (par Wave, Orange Money, virement ou especes), vous devez l\'enregistrer dans les Entrees.', colW);
  doc.text(p4Text, colX, curY);
  curY += (p4Text.length * 4) + 2;

  curY += drawStepCard(colX, curY, colW, 1, 'Aller dans les Entrees', 'Appuyez sur l\'icone [Entrees] en bas ou sur « + Ajouter » depuis l\'accueil, puis sur le bouton « + Nouvelle ».', [
    'Une fenetre intitulee « Nouvelle Entree » apparait.'
  ]);

  curY += drawStepCard(colX, curY, colW, 2, 'Selectionner le Type & le Membre', 'Configurez le type d\'operation et l\'emetteur :', [
    'Type d\'entree : Choisissez « Cotisation » (ou Don / Collecte).',
    'Contributeur : Selectionnez le membre concerne dans le menu deroulant.'
  ]);

  curY += drawStepCard(colX, curY, colW, 3, 'Mois de depart & Duree couverte', 'Indiquez la periode prise en charge par ce versement :', [
    'Mois de depart : Le premier mois paye (ex: octobre 2026).',
    'Nombre de mois : Si le membre paie pour 3 mois d\'un coup, saisissez « 3 ».'
  ]);

  curY += drawStepCard(colX, curY, colW, 4, 'Montant & Validation', 'Saisissez le montant total recu en FCFA (ex: 30 000 FCFA).', [
    'Repartition automatique : Le systeme divise le montant et valide automatiquement les 3 mois dans la grille !',
    'Appuyez sur « Enregistrer » pour valider definitivement.'
  ]);

  drawAlertBox(colX, curY, colW, 'success', 'Impact immediat', 'Le solde de l\'organisation est instantanement augmente et la matrice des cotisations est mise a jour !');

  drawSmartphoneFrame(phoneX, phoneY, phoneW, phoneH, getBase64Image('step6_modal_paiement.png'));

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Ecran 4 : Enregistrement d\'une cotisation multi-mois', phoneX + (phoneW / 2), phoneY + phoneH + 6, { align: 'center' });

  drawFooter(5, 6);

  // ==========================================
  // PAGE 6 : MODULE 5 - MATRICE & BONNES PRATIQUES
  // ==========================================
  doc.addPage();
  drawHeader(6, 'MODULE 5 : CONTROLE DE LA MATRICE & ASTUCES');

  curY = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...textDark);
  doc.text('Suivre les cotisations mensuelles', colX, curY);
  curY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  const p5Text = doc.splitTextToSize('La Matrice des Cotisations croise l\'ensemble des membres et les 12 mois de l\'annee. C\'est votre tableau de controle par excellence.', colW);
  doc.text(p5Text, colX, curY);
  curY += (p5Text.length * 4) + 2;

  curY += drawStepCard(colX, curY, colW, 1, 'Acceder a la Matrice', 'Appuyez sur le menu [••• Plus] puis choisissez « Matrice des cotisations » (ou tapez /cotisations).', [
    'La colonne des noms reste figee a gauche pour une lecture facile.'
  ]);

  curY += drawStepCard(colX, curY, colW, 2, 'Defilement horizontal tactile', 'Sur votre smartphone, glissez simplement votre doigt vers la gauche pour faire defiler les mois :', [
    'Jan, Fev, Mar, Avr, Mai, Juin, Juil, Aout, Sept, Oct, Nov, Dec.'
  ]);

  curY += drawStepCard(colX, curY, colW, 3, 'Comprendre les statuts', 'Chaque cellule mensuelle indique l\'etat de la cotisation :', [
    'Pastille verte : Cotisation reglee et a jour pour le mois.',
    'Pastille rouge / [ ! ] : Membre en retard pour ce mois.',
    'Cellule vide : Aucune obligation sur cette periode.'
  ]);

  drawStepCard(colX, curY, colW, 4, 'Conseils & Bonnes Pratiques', 'Pour une gestion sereine au quotidien :', [
    '1. Enregistrez les paiements au fil de l\'eau des reception du SMS de transfert Wave / Orange Money.',
    '2. Verifiez toujours le nom du contributeur avant d\'appuyer sur Enregistrer.',
    '3. Deconnectez-vous en fin de session en appuyant sur l\'icone de sortie en haut a droite.'
  ]);

  drawSmartphoneFrame(phoneX, phoneY, phoneW, phoneH, getBase64Image('step7_cotisations.png'));

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Ecran 5 : Grille de suivi mensuel croise des cotisations', phoneX + (phoneW / 2), phoneY + phoneH + 6, { align: 'center' });

  drawFooter(6, 6);

  // Save the PDF
  const outputFileName = 'Manuel_Utilisation_CJEP_Mobile.pdf';
  const outputPath = path.resolve(outputFileName);
  fs.writeFileSync(outputPath, Buffer.from(doc.output('arraybuffer')));
  console.log(`Manual PDF generated successfully: ${outputPath} (Size: ${fs.statSync(outputPath).size} bytes)`);

  const publicOutputPath = path.resolve('public', outputFileName);
  fs.writeFileSync(publicOutputPath, Buffer.from(doc.output('arraybuffer')));
  console.log(`Copied manual to public folder: ${publicOutputPath}`);
}

createManual();
